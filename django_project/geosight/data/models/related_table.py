# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import uuid

from dateutil import parser
from django.contrib.gis.db import models
from django.db import connection, transaction

from core.models.general import (
    AbstractEditData, AbstractTerm, AbstractVersionData
)
from geosight.data.models.field_layer import BaseFieldLayerAbstract
from geosight.data.utils import extract_time_string
from geosight.importer.utilities import date_from_timestamp
from geosight.permission.models.manager import PermissionManager


class RelatedTableException(Exception):
    """Error class for RelatedTable."""

    def init(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class RelatedTable(AbstractTerm, AbstractEditData, AbstractVersionData):
    """Related table data."""

    unique_id = models.UUIDField(
        default=uuid.uuid4, editable=False
    )
    objects = models.Manager()
    permissions = PermissionManager()

    def able_to_edit(self, user):
        """If able to delete."""
        return user.is_staff or user == self.creator

    def __str__(self):
        return f'{self.name} ({self.unique_id})'

    def save(self, *args, **kwargs):
        """On save method."""
        super(RelatedTable, self).save(*args, **kwargs)
        # Update dashboard version
        for dashboard_rt in self.dashboardrelatedtable_set.all():
            dashboard_rt.dashboard.increase_version()

    def insert_row(self, data: dict, row_id=None, replace=False):
        """Insert row.

        It will be inserted as latest row.
        """
        if row_id is not None:
            replace = True

        try:
            if row_id is not None:
                row = RelatedTableRow.objects.get(pk=row_id)
                row.data = data
            else:
                last = self.relatedtablerow_set.last()
                order = last.order + 1 if last else 0
                if replace:
                    order = data.get('order', order)

                row, _ = RelatedTableRow.objects.get_or_create(
                    table=self,
                    order=order,
                    defaults={
                        'data': data
                    }
                )
                if replace:
                    row.data = data
            row.save()
            return row
        except KeyError as e:
            raise RelatedTableException(f'{e} is required.')

    def insert_rows(self, data_list: list, replace=False):
        """Insert rows."""
        errors = {}
        try:
            with transaction.atomic():
                if replace:
                    self.relatedtablerow_set.all().delete()

                for idx, data in enumerate(data_list):
                    try:
                        self.insert_row(data, replace=replace)
                    except RelatedTableException as e:
                        errors[f'{idx}'] = f'{e}'
                if errors.keys():
                    raise Exception()
        except Exception:
            pass
        return errors

    @property
    def related_fields(self):
        """Return fields of table."""
        if not self.relatedtablefield_set.count():
            self.set_fields()
        return list(
            self.relatedtablefield_set.values_list(
                'name', flat=True
            ).order_by('name')
        )

    def check_relation(self):
        """Check relation."""
        from geosight.data.models.dashboard import DashboardRelatedTable
        related_fields = self.related_fields
        for rel_obj in DashboardRelatedTable.objects.filter(object=self):
            if rel_obj.geography_code_field_name not in related_fields:
                rel_obj.delete()
                rel_obj.dashboard.increase_version()
                rel_obj.dashboard.save()
            elif rel_obj.selected_related_fields:
                selected_related_fields = []
                for selected in rel_obj.selected_related_fields:
                    if selected in related_fields:
                        selected_related_fields.append(selected)
                rel_obj.selected_related_fields = selected_related_fields
                rel_obj.save()
                rel_obj.dashboard.increase_version()
                rel_obj.dashboard.save()

    @property
    def data(self):
        """Return data of related table."""
        query = self.relatedtablerow_set.all()
        output = []
        for row in query:
            if row.data:
                row.data['id'] = row.id
                output.append(row.data)
        return output

    @property
    def fields_definition(self):
        """Return fields with it's definition."""
        from geosight.data.serializer.related_table import (
            RelatedTableFieldSerializer
        )
        if not self.relatedtablefield_set.count():
            self.set_fields()
        return RelatedTableFieldSerializer(
            self.relatedtablefield_set.order_by('name'), many=True,
            context={
                'example_data': [
                    self.relatedtablerow_set.first(),
                    self.relatedtablerow_set.last()
                ]
            }
        ).data

    @fields_definition.setter
    def fields_definition(self, fields):
        self.relatedtablefield_set.all().delete()
        for field in fields:
            self.add_field(
                field.get('name'),
                field.get('alias'),
                field.get('type')
            )

    def query(
            self, select, order_by, country_geom_ids, geo_field,
            geo_type='ucode'
    ):
        """Return the query."""
        from geosight.georepo.models.entity import Entity
        countries = [
            f'{country}' for country in list(
                Entity.objects.countries().filter(
                    geom_id__in=country_geom_ids
                ).values_list(
                    'pk', flat=True
                )
            )
        ]
        if not countries:
            return None

        if geo_type.lower() == 'ucode':
            return (
                f"select {select} "
                f"  from geosight_data_relatedtablerow as row "
                f"LEFT JOIN geosight_georepo_entity as entity "
                f"  ON data ->> '{geo_field}'::text=entity.geom_id::text "
                f"WHERE row.table_id={self.id} AND "
                f"  ("
                f"      entity.country_id IN ({','.join(countries)}) OR"
                f"      ("
                f"          entity.country_id is NULL AND "
                f"          entity.id IN ({','.join(countries)})"
                f"      )"
                f"  ) "
                f"ORDER BY {order_by}"
            )
        else:
            return (
                f"select {select} "
                f"from geosight_data_relatedtablerow as row "
                f"LEFT JOIN geosight_georepo_entitycode as entity_code "
                f"ON data ->> '{geo_field}'::text=entity_code.code::text "
                f"AND LOWER(entity_code.code_type)='{geo_type.lower()}' "
                f"LEFT JOIN geosight_georepo_entity as entity "
                f"ON entity.id=entity_code.entity_id "
                f"WHERE row.table_id={self.id} AND "
                f"  ("
                f"      entity.country_id IN ({','.join(countries)}) OR"
                f"      ("
                f"          entity.country_id is NULL AND "
                f"          entity.id IN ({','.join(countries)})"
                f"      )"
                f"  ) "
                f"ORDER BY {order_by}"
            )

    def data_field(
            self, field,
            country_geom_ids=None,
            geo_field=None, geo_type='ucode'
    ):
        """Return data field."""
        if not country_geom_ids:
            return self.relatedtablerow_set.values_list(
                f'data__{field}', flat=True
            ).distinct(f'data__{field}').order_by(f'data__{field}')
        else:
            with connection.cursor() as cursor:
                # Update the cast
                cast = ''
                _field = self.relatedtablefield_set.filter(name=field).first()
                if _field:
                    if _field.type == 'number':
                        cast = '::numeric'

                # query the data
                query = self.query(
                    country_geom_ids=country_geom_ids,
                    select=f"DISTINCT(data ->> '{field}'){cast}",
                    geo_field=geo_field,
                    geo_type=geo_type,
                    order_by=f"data ->> '{field}'",
                )
                if not query:
                    return []
                cursor.execute(query)
                rows = cursor.fetchall()
                return [row[0] for row in rows]

    def data_with_query(
            self, country_geom_ids,
            geo_field, date_field=None, date_format=None, geo_type='ucode',
            max_time=None, min_time=None, limit=25, offset=None
    ):
        """Return data of related table."""
        # Check codes based on code type
        output = []
        has_next = False
        with connection.cursor() as cursor:
            query = self.query(
                country_geom_ids=country_geom_ids,
                geo_field=geo_field,
                select=(
                    "row.id, row.order, row.data::json, "
                    "geom_id, concept_uuid, name, admin_level "
                ),
                geo_type=geo_type,
                order_by='row.id',
            )
            if not query:
                return []
            if offset is not None:
                query += f' LIMIT {limit} OFFSET {offset}'

            cursor.execute(query)
            rows = cursor.fetchall()
            if len(rows) > 0:
                has_next = True
            for idx, row in enumerate(rows):
                data = row[2]
                data.update({
                    'id': row[0],
                    'order': row[1],
                    'concept_uuid': row[4],
                    'geometry_code': row[3],
                    'geometry_name': row[5],
                    'admin_level': row[6],
                })
                if date_field:
                    try:
                        date_time = data[date_field]
                        # Update date field
                        data[date_field] = extract_time_string(
                            format_time=date_format,
                            value=date_time
                        ).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
                        # Filter by date
                        if max_time and data[date_field] > max_time:
                            continue
                        if min_time and data[date_field] < min_time:
                            continue
                    except KeyError:
                        continue
                output.append(data)
        return output, has_next

    def dates_with_query(
            self, country_geom_ids,
            geo_field, date_field=None, date_format=None, geo_type='ucode'
    ):
        """Return data of related table."""
        with connection.cursor() as cursor:
            query = self.query(
                country_geom_ids=country_geom_ids,
                geo_field=geo_field,
                select=f"DISTINCT(data ->> '{date_field}')",
                geo_type=geo_type,
                order_by=f"data ->> '{date_field}'",
            )
            if not query:
                return []
            cursor.execute(query)
            dates = []
            for row in cursor.fetchall():
                if row[0]:
                    dates.append(
                        extract_time_string(
                            format_time=date_format,
                            value=row[0]
                        ).isoformat()
                    )
        return dates

    def add_field(self, name, label, field_type):
        """Add a new field definition to the related table."""
        if field_type not in ['date', 'number', 'string']:
            raise ValueError(f"Invalid type value for Related Table field: "
                             f"{field_type}")
        query = self.relatedtablefield_set.all()
        if query.filter(name=name):
            raise ValueError(f"Field already exists in Related Table: {name}")

        self.relatedtablefield_set.all().get_or_create(
            related_table=self,
            name=name,
            defaults={'alias': label, 'type': field_type}
        )

    def set_fields(self):
        """Set fields data."""
        related_fields = []
        row = self.relatedtablerow_set.first()
        if row:
            first_data = self.relatedtablerow_set.first()
            if first_data and first_data.data:
                related_fields = list(first_data.data.keys())

        first = self.relatedtablerow_set.first()
        second = self.relatedtablerow_set.last()

        ids = []
        query = self.relatedtablefield_set.all()
        for field in related_fields:
            value = first.data[field]
            is_type_datetime = False
            try:
                value = float(value)
            except (TypeError, ValueError):
                pass
            is_type_number = type(value) is not str

            # Check if datetime
            try:
                if is_type_number:
                    date_time = date_from_timestamp(value)
                    is_type_datetime = date_time is not None
                else:
                    try:
                        # If value is number
                        try:
                            _value = float(value)
                        except ValueError:
                            pass
                        else:
                            date_time = date_from_timestamp(_value)
                            if not date_time:
                                raise ValueError()
                        parser.parse(value)
                        is_type_datetime = True
                    except ValueError:
                        pass
            except (ValueError, TypeError):
                pass
            example = [first.data[field]]
            try:
                example.append(second.data[field])
            except KeyError:
                pass

            field, _ = query.get_or_create(
                related_table=self,
                name=field,
                defaults={
                    'alias': field,
                    'type': 'date' if is_type_datetime else (
                        'number' if is_type_number else 'string'
                    )
                }
            )
            ids.append(field.id)

        query.exclude(id__in=ids).delete()

    def save_relations(self, data):
        """Save all relationship data."""
        ids = []
        query = self.relatedtablefield_set.all()
        try:
            for idx, field_data in enumerate(json.loads(data['data_fields'])):
                try:
                    _type = field_data['type']
                    name = field_data['name']
                    alias = field_data['alias']
                    field, _ = query.get_or_create(
                        related_table=self,
                        name=name,
                        defaults={
                            'alias': alias,
                            'type': _type
                        }
                    )
                    field.alias = field_data['alias']
                    field.type = field_data['type']
                    field.save()
                    ids.append(field.id)
                except KeyError:
                    pass
        except Exception:
            pass

        query.exclude(id__in=ids).delete()

    @property
    def last_importer(self):
        """Return last importer."""
        from django.urls import reverse
        from geosight.importer.models.attribute import ImporterAttribute
        attribute = ImporterAttribute.objects.filter(
            name='related_table_id', value=self.id
        ).order_by('importer_id').last()
        if attribute:
            return reverse(
                'admin:geosight_importer_importer_change',
                args=(attribute.importer.id,)
            )
        return None

    def make_none_to_empty_string(self):
        """Make empty string for empty data."""
        query = self.relatedtablerow_set.all()
        for row in query:
            if row.data:
                keys = row.data.keys()
                for key in keys:
                    if row.data[key] is None:
                        row.data[key] = ''
                row.save()
        self.increase_version()


class RelatedTableRow(models.Model):
    """Row of Related Table."""

    table = models.ForeignKey(RelatedTable, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    data = models.JSONField(null=True, blank=True)

    class Meta:  # noqa: D106
        ordering = ('order',)


class RelatedTableField(BaseFieldLayerAbstract):
    """Field data of Related Table."""

    related_table = models.ForeignKey(
        RelatedTable, on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('related_table', 'name')

    def __str__(self):
        return f'{self.name}'
