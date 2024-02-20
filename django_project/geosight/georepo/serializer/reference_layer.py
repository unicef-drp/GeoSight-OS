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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db.models import Extent
from django.urls import reverse
from drf_yasg import openapi
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerViewLevel
)


class ReferenceLayerViewLevelSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerViewLevel."""

    level_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_level_name(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return obj.name

    def get_url(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return reverse(
            'reference-dataset-entity-api-list',
            kwargs={'identifier': obj.reference_layer.identifier}
        ) + f'?admin_level={obj.level}'

    class Meta:  # noqa: D106
        model = ReferenceLayerViewLevel
        fields = ('level', 'level_name', 'url')


class ReferenceLayerViewSerializer(DynamicModelSerializer):
    """Serializer for ReferenceLayerView."""

    bbox = serializers.SerializerMethodField()
    vector_tiles = serializers.SerializerMethodField()
    possible_id_types = serializers.SerializerMethodField()
    dataset_levels = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_bbox(self, obj: ReferenceLayerView):
        """Return value."""
        try:
            return [
                float(str(round(geom, 4))) for geom in
                obj.entity_set.aggregate(
                    Extent('geometry')
                )['geometry__extent']
            ]
        except TypeError:
            return None

    def get_vector_tiles(self, obj: ReferenceLayerView):
        """Return value."""
        url = reverse(
            'reference-dataset-vector-tile-api',
            kwargs={
                'identifier': obj.identifier,
                'z': '0',
                'x': '1',
                'y': '2',
            }
        )
        request = self.context.get('request', None)
        if request:
            url = request.build_absolute_uri(url)
        url = url.replace(
            '/0/', '/{z}/'
        ).replace(
            '/1/', '/{x}/'
        ).replace(
            '/2/', '/{y}/'
        )
        return url

    def get_possible_id_types(self, obj: ReferenceLayerView):
        """Return value."""
        return ['ucode', 'concept_uuid']

    def get_dataset_levels(self, obj: ReferenceLayerView):
        """Return value."""
        return ReferenceLayerViewLevelSerializer(
            obj.referencelayerviewlevel_set.order_by('level'), many=True
        ).data

    def get_tags(self, obj: ReferenceLayerView):
        """Return value."""
        return ['GeoSight', 'local']

    def get_permission(self, obj: ReferenceLayerView):
        """Return permission."""
        from geosight.permission.models.resource.reference_layer_view import (
            ReferenceLayerViewPermission
        )
        try:
            return obj.permission.all_permission(
                self.context.get('user', None)
            )
        except ReferenceLayerViewPermission.DoesNotExist:
            ReferenceLayerViewPermission.objects.create(obj=obj)
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = ReferenceLayerView
        fields = '__all__'
        lookup_field = "identifier"
        swagger_schema_fields = {
            'delete_body': openapi.Schema(
                description='List of identifier of values.',
                type=openapi.TYPE_ARRAY,
                items=openapi.Items(
                    type=openapi.TYPE_STRING
                )
            )
        }


class ReferenceLayerCentroidUrlSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayerView."""

    level_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_level_name(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return obj.name

    def get_url(self, obj: ReferenceLayerViewLevel):
        """Return value."""
        return reverse(
            'reference-dataset-centroid-api',
            kwargs={
                'identifier': obj.reference_layer.identifier,
                'level': obj.level
            }
        )

    class Meta:  # noqa: D106
        model = ReferenceLayerViewLevel
        fields = ('level', 'level_name', 'url')
