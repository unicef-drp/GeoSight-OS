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
    AbstractEditData, AbstractTerm, AbstractVersionData, AbstractSource
)
from geosight.data.models.field_layer import BaseFieldLayerAbstract
from geosight.data.utils import extract_time_string
from geosight.importer.utilities import date_from_timestamp
from geosight.permission.models.manager import PermissionManager


class RelatedTableException(Exception):
    """Error class for RelatedTable."""

    def init(self, message):  # noqa
        self.message = message
        super().__init__(self.message)


class RelatedTableGroup(AbstractTerm):
    """A model for the group of related table."""

    pass


class RelatedTable(
    AbstractTerm, AbstractEditData, AbstractVersionData, AbstractSource
):
    """Related table data."""

    unique_id = models.UUIDField(
        default=uuid.uuid4, editable=False
    )
    group = models.ForeignKey(
        RelatedTableGroup,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    objects = models.Manager()
    permissions = PermissionManager()

    def able_to_edit(self, user):
        """
        Check if a user has permission to edit the table.

        :param user: Django user instance.
        :type user: django.contrib.auth.models.User
        :return: ``True`` if the user can edit, otherwise ``False``.
        :rtype: bool
        """
        return user.is_staff or user == self.creator

    def __str__(self):  # noqa: D105
        return f'{self.name} ({self.unique_id})'

    def save(self, *args, **kwargs):  # noqa
        super(RelatedTable, self).save(*args, **kwargs)
        # Update dashboard version
        for dashboard_rt in self.dashboardrelatedtable_set.all():
            dashboard_rt.dashboard.increase_version()

    def insert_row(self, data: dict, row_id=None, replace=False):
        """
        Insert or update a single row in the related table.

        :param data: Data dictionary representing the row.
        :type data: dict
        :param row_id: Existing row ID to update (optional).
        :type row_id: int or None
        :param replace: Whether to replace existing data.
        :type replace: bool
        :return: The inserted or updated :class:`RelatedTableRow`.
        :rtype: RelatedTableRow
        :raises RelatedTableException: If required data keys are missing.
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
        """
        Insert multiple rows into the related table.

        :param data_list: List of row data dictionaries.
        :type data_list: list
        :param replace: Whether to delete existing rows first.
        :type replace: bool
        :return: Dictionary of errors (if any) with index as key.
        :rtype: dict
        :raises Exception: Raised if one or more rows fail to insert.
        """
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
        """
        Retrieve the names of all fields in the related table.

        :return: List of field names.
        :rtype: list[str]
        """
        if not self.relatedtablefield_set.count():
            self.set_fields()
        return list(
            self.relatedtablefield_set.values_list(
                'name', flat=True
            ).order_by('name')
        )

    def check_relation(self):
        """
        Validate and update relationships with dashboards.

        Removes or updates related fields in dashboards if mismatched.
        """
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
        """
        Return all data rows of the related table.

        :return: List of data dictionaries including row IDs.
        :rtype: list[dict]
        """
        query = self.relatedtablerow_set.all()
        output = []
        for row in query:
            if row.data:
                row.data['id'] = row.id
                output.append(row.data)
        return output

    @property
    def fields_definition(self):
        """
        Return all fields with their definitions and examples.

        :return: Serialized field definitions.
        :rtype: list[dict]
        """
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
        """
        Replace all field definitions with the given list.

        :param fields: List of field definition dictionaries.
        :type fields: list[dict]
        """
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
        """
        Build a SQL query string for retrieving related table data.

        :param select: SQL select clause.
        :type select: str
        :param order_by: SQL order by clause.
        :type order_by: str
        :param country_geom_ids: List of country geometry IDs.
        :type country_geom_ids: list
        :param geo_field: Field name in data representing the geographic key.
        :type geo_field: str
        :param geo_type: Type of geographic code (default 'ucode').
        :type geo_type: str
        :return: SQL query string or None.
        :rtype: str or None
        """
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
        """
        Retrieve distinct values for a specific data field.

        This method returns the unique values of a given field across all rows.
        If ``country_geom_ids`` are provided, the data is filtered to include
        only rows linked to those geometries.

        :param field: The name of the field to extract values from.
        :type field: str
        :param country_geom_ids: Optional list of geometry IDs to filter by.
        :type country_geom_ids: list or None
        :param geo_field: Optional geometry field used for filtering.
        :type geo_field: str or None
        :param geo_type:
            Type of geographic identifier (default is ``'ucode'``).
        :type geo_type: str
        :return: List of distinct values for the specified field.
        :rtype: list
        """
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
        """
        Retrieve related table data joined with geographic context.

        This method executes a database query to fetch related table rows
        and enriches each entry with geometry and metadata information.
        Optionally filters the data based on date fields.

        :param country_geom_ids: List of geometry IDs to filter the data by.
        :type country_geom_ids: list
        :param geo_field: Name of the geometry field used in the join.
        :type geo_field: str
        :param date_field: Optional field name representing the date.
        :type date_field: str or None
        :param date_format: Format to interpret date values, if applicable.
        :type date_format: str or None
        :param geo_type: Geographic code type (default ``'ucode'``).
        :type geo_type: str
        :param max_time: Optional maximum datetime filter (ISO 8601 string).
        :type max_time: str or None
        :param min_time: Optional minimum datetime filter (ISO 8601 string).
        :type min_time: str or None
        :param limit: Maximum number of rows to return (default 25).
        :type limit: int
        :param offset: Optional pagination offset.
        :type offset: int or None
        :return: A tuple containing:
            - List of result dictionaries with data and geometry info.
            - Boolean indicating if there are more results (has_next).
        :rtype: tuple(list[dict], bool)
        """
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
                        ).isoformat()
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
        """
        Retrieve all distinct date values from a related table.

        This method executes a query to fetch unique date entries,
        converting them into ISO 8601 formatted strings.

        :param country_geom_ids: List of geometry IDs to filter data by.
        :type country_geom_ids: list
        :param geo_field: Geometry field name used for filtering.
        :type geo_field: str
        :param date_field: The name of the field containing date values.
        :type date_field: str
        :param date_format: Optional date parsing format.
        :type date_format: str or None
        :param geo_type: Geographic code type (default ``'ucode'``).
        :type geo_type: str
        :return: List of unique ISO-formatted date strings.
        :rtype: list[str]
        """
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
        """
        Add a new field definition to the related table.

        :param name: Internal name of the field.
        :type name: str
        :param label: Display name (alias) for the field.
        :type label: str
        :param field_type:
            Data type of the field (``'date'``, ``'number'``, or ``'string'``).
        :type field_type: str
        :raises ValueError:
            If the field type is invalid or the field already exists.
        """
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
        """
        Infer and set field definitions from existing table rows.

        This method analyzes the first and last row data to automatically
        detect field names and data types
        (``date``, ``number``, or ``string``).
        Existing field definitions not found in the current data are deleted.
        :raises ValueError:
            If the field type is invalid or the field already exists.
        """
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
        """
        Save all relationship field definitions to the related table.

        This method updates or creates field definitions based on the
        ``data_fields`` property provided in the ``data`` dictionary.
        Any fields not included in the latest update will be deleted.

        :param data:
            Dictionary containing a ``data_fields``
            JSON array of field definitions.
        :type data: dict
        """
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
        """
        Retrieve the most recent importer associated with this related table.

        This method finds the latest
        :class:`geosight.importer.models.attribute.ImporterAttribute`
        entry that references this table and returns its admin edit URL.

        :return: Admin URL for the last importer or ``None`` if not found.
        :rtype: str or None
        """
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
        """
        Replace all ``None`` values in related table data with empty strings.

        Iterates through all rows and updates their data dictionary, replacing
        ``None`` with ``''`` for consistent display and export.
        """
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
