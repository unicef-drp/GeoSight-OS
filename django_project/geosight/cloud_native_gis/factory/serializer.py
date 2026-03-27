"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Irwan Fathurrahman'
__date__ = '10/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.related_table import RelatedTableRow
from geosight.data.serializer.related_table import (
    RelatedTableRowApiFlatSerializer
)


def serializer_factory(model_class):
    """
    Dynamically generate a serializer for a given Django model class.

    This function introspects the corresponding database table of the
    provided model and generates a serializer class that exposes all
    fields as read-only fields. It is typically used for models whose
    schema is dynamic or discovered at runtime (e.g., cloud-native GIS layers).

    :param model_class: The Django model class to build the serializer for.
    :type model_class: django.db.models.Model
    :return:
        A dynamically generated serializer class exposing all model fields.
    :rtype: rest_framework.serializers.ModelSerializer
    """
    if model_class is RelatedTableRow:
        return RelatedTableRowApiFlatSerializer
    return type(
        'DynamicContextLayerSerializer',
        (DynamicModelSerializer,),
        {
            'id': serializers.CharField(source='pk', read_only=True),
            'Meta': type(
                'Meta', (), {'model': model_class, 'fields': '__all__'}
            )
        }
    )
