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

import uuid

from dateutil import parser
from django.contrib.gis.db import models
from django.db import transaction
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractEditData, AbstractTerm
from geosight.data.utils import extract_time_string
from geosight.importer.utilities import date_from_timestamp
from geosight.permission.models.manager import PermissionManager


class RelatedTableException(Exception):
    """Error class for RelatedTable."""

    def init(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class RelatedTable(AbstractTerm, AbstractEditData):
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

    def insert_row(self, data: dict, replace=False):
        """Insert row.

        It will be inserted as latest row.
        """
        try:
            last = self.relatedtablerow_set.last()
            order = last.order + 1 if last else 0
            if replace:
                order = data.get('order', order)

            row, _ = RelatedTableRow.objects.get_or_create(
                table=self,
                order=order
            )
            if replace:
                row.data = data
            row.save()
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
        row = self.relatedtablerow_set.first()
        if row:
            return self.relatedtablerow_set.first().data.keys()
        return []

    def check_relation(self):
        """Check relation."""
        from geosight.data.models.dashboard import DashboardRelatedTable
        related_fields = self.related_fields
        for rel_obj in DashboardRelatedTable.objects.filter(object=self):
            if rel_obj.geography_code_field_name not in related_fields:
                rel_obj.delete()
            elif rel_obj.selected_related_fields:
                selected_related_fields = []
                for selected in rel_obj.selected_related_fields:
                    if selected in related_fields:
                        selected_related_fields.append(selected)
                rel_obj.selected_related_fields = selected_related_fields
                rel_obj.save()

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

    def data_field(self, field):
        """Return data field."""
        return self.relatedtablerow_set.values_list(
            f'data__{field}', flat=True
        )

    def data_with_query(
            self, reference_layer_uuid,
            geo_field, date_field=None, date_format=None, geo_type='ucode',
            max_time=None, min_time=None
    ):
        """Return data of related table."""
        from geosight.data.serializer.related_table import (
            RelatedTableRowSerializer
        )
        from geosight.georepo.models.reference_layer import ReferenceLayerView
        from geosight.georepo.models.entity import Entity, EntityCode
        try:
            reference_layer = ReferenceLayerView.objects.get(
                identifier=reference_layer_uuid
            )
        except ReferenceLayerView.DoesNotExist:
            return []

        # Check codes based on code type
        if geo_type.lower() == 'ucode':
            codes = Entity.objects.filter(
                reference_layer=reference_layer
            ).values_list('geom_id', flat=True)
        else:
            codes = EntityCode.objects.filter(
                entity__reference_layer=reference_layer,
                code_type=geo_type
            ).values_list('code', flat=True)

        lookup = f'data__{geo_field}__in'
        queries = self.relatedtablerow_set.filter(**{lookup: list(codes)})
        output = []
        concept_uuid = {}
        for row in queries:
            data = RelatedTableRowSerializer(row).data
            data.update(row.data)

            try:
                if date_field:
                    # Update date field
                    value = data[date_field]
                    data[date_field] = extract_time_string(
                        format_time=date_format,
                        value=value
                    ).isoformat()

                    # Filter by date
                    if max_time and data[date_field] > max_time:
                        continue
                    if min_time and data[date_field] < min_time:
                        continue

                # Update geo field
                entity = None
                value = data[geo_field]
                if value in concept_uuid:
                    entity = concept_uuid[value]
                else:
                    if geo_type.lower() == 'ucode':
                        entity = Entity.objects.filter(
                            geom_id=value,
                            reference_layer=reference_layer
                        ).first()
                    else:
                        entity_code = EntityCode.objects.filter(
                            entity__reference_layer=reference_layer,
                            code=value,
                            code_type=geo_type
                        ).first()
                        if entity_code:
                            entity = entity_code.entity

                # If entity exist, add to output
                if entity:
                    data['concept_uuid'] = entity.concept_uuid
                    data['geometry_code'] = entity.geom_id
                    data['admin_level'] = entity.admin_level
                    concept_uuid[value] = entity
                    output.append(data)
            except (KeyError, ValueError, Entity.DoesNotExist):
                pass
        return output

    def dates_with_query(self, codes, geo_field, date_field, date_format):
        """Return data of related table."""
        lookup = f'data__{geo_field}__in'
        value_list = f'data__{date_field}'
        dates = self.relatedtablerow_set.filter(
            **{lookup: list(codes)}
        ).values_list(value_list, flat=True)

        output = []
        for value in dates:
            try:
                # Update date field
                output.append(
                    extract_time_string(
                        format_time=date_format,
                        value=value
                    ).isoformat()
                )

            except (KeyError, ValueError):
                pass
        return list(set(output))

    @property
    def fields_definition(self):
        """Return fields with it's definition."""
        fields = []
        first = self.relatedtablerow_set.first()
        second = self.relatedtablerow_set.last()
        for field in self.related_fields:
            value = first.data[field]
            is_type_datetime = False
            try:
                value = float(value)
            except (TypeError, ValueError):
                pass
            is_type_number = type(value) != str

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
            fields.append({
                'name': field,
                'type': 'Date' if is_type_datetime else (
                    'Number' if is_type_number else 'String'
                ),
                'example': example
            })
        return fields


class RelatedTableRow(models.Model):
    """Row of Related Table."""

    table = models.ForeignKey(RelatedTable, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    data = models.JSONField(null=True, blank=True)

    class Meta:  # noqa: D106
        ordering = ('order',)

    @property
    def data_from_eav(self):
        """Get data from eav."""
        from geosight.data.serializer.related_table import (
            RelatedTableRowSerializer
        )
        data = RelatedTableRowSerializer(self).data
        data.update(self.data_from_eav_model)
        return data

    @property
    def data_from_eav_model(self):
        """Get data from eav model."""
        data = {}
        for eav in self.relatedtableroweav_set.all():
            data[eav.name] = eav.cast_value
        return data


# TODO:
#  This is deprecated
class RelatedTableRowEAV(models.Model):
    """EAV of a cell of Related Table Row."""

    row = models.ForeignKey(RelatedTableRow, on_delete=models.CASCADE)
    name = models.CharField(
        max_length=100,
        help_text=_("The name of attribute")
    )
    value = models.TextField(
        null=True, blank=True,
        help_text=_("The value of attribute")
    )

    class Meta:  # noqa: D106
        unique_together = ('row', 'name')

    def str(self):
        """Return string."""
        return f'{self.name}'

    @property
    def cast_value(self):
        """Return value in casted."""
        try:
            return float(self.value)
        except ValueError:
            return self.value
