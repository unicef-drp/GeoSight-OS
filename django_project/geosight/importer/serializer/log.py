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

from django.shortcuts import reverse
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.related_table import RelatedTable
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.importer.models.importer import ImportType
from geosight.importer.models.log import (
    ImporterLog, ImporterLogData, ImporterLogDataSaveProgress
)


class ImporterLogSerializer(DynamicModelSerializer):
    """Serializer for ImporterLog."""

    count_data = serializers.SerializerMethodField()
    saved_data = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    browse_url = serializers.SerializerMethodField()

    def get_count_data(self, obj: ImporterLog):
        """Return count data."""
        return obj.total_count

    def get_saved_data(self, obj: ImporterLog):
        """Return saved data."""
        return obj.success_count

    def get_permission(self, obj: ImporterLog):
        """Return saved data."""
        return obj.importer.permissions(self.context.get('user', None))

    def get_browse_url(self, obj: ImporterLog):
        """Return url for data browse."""
        return reverse(
            'admin-importer-log-data-view',
            kwargs={"pk": obj.pk}
        )

    def to_representation(self, obj: ImporterLog):
        """Append importer."""
        from geosight.importer.serializer.importer import ImporterSerializer
        representation = super().to_representation(obj)
        if not self.ignore_to_presentation:
            for key, value in ImporterSerializer(
                    obj.importer,
                    exclude=['id', 'last_run', 'last_run_result', 'logs']
            ).data.items():
                representation[key] = value
        try:
            if not obj.importer.job:
                representation['urls']['edit'] = reverse(
                    'admin-importer-edit-view', args=[obj.importer.id]
                )
        except KeyError:
            pass

        # Update for related table
        try:
            related_table = RelatedTable.objects.get(
                id=obj.importer.attributes['related_table_id']
            )
            count_data = related_table.relatedtablerow_set.count()
            representation['saved_data'] = count_data
            representation['count_data'] = count_data
            representation['browse_url'] = reverse(
                'admin-related-table-data-view',
                kwargs={"pk": related_table.pk}
            )

        except (KeyError, RelatedTable.DoesNotExist):
            pass

        return representation

    class Meta:  # noqa: D106
        model = ImporterLog
        exclude = ()


class ImporterLogDataSerializer(DynamicModelSerializer):
    """Serializer for ImporterLogData."""

    status = serializers.SerializerMethodField()
    data = serializers.SerializerMethodField()

    def get_status(self, obj: ImporterLogData):
        """Return status."""
        return obj.status

    def get_data(self, obj: ImporterLogData):
        """Return data."""
        data = obj.data
        if obj.log.importer.import_type == ImportType.INDICATOR_VALUE:
            try:
                ref_layer = ReferenceLayerView.objects.get(
                    identifier=data.get('reference_layer_identifier')
                )
                key = 'admin_level'
                try:
                    if key not in data.keys() or data[key] is None:
                        obj.data[key] = ref_layer.entities_set.filter(
                            geom_id=data['geo_code']
                        ).first().admin_level
                        obj.save()
                except (KeyError, AttributeError):
                    pass

                data['reference_layer_name'] = ref_layer.get_name()
                data['reference_layer_id'] = ref_layer.id
            except ReferenceLayerView.DoesNotExist:
                pass

            try:
                del data['indicator_shortcode']
            except KeyError:
                pass
        return data

    class Meta:  # noqa: D106
        model = ImporterLogData
        exclude = ('log',)


class ImporterLogDataSaveProgressSerializer(DynamicModelSerializer):
    """Serializer for ImporterLogData."""

    class Meta:  # noqa: D106
        model = ImporterLogDataSaveProgress
        exclude = ('log',)
