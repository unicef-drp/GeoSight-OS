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

from django.db import connection
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer


def serializer_factory(model_class):
    """
    Create a serializer that includes all fields from the model's table.
    """
    # Introspect fields from the DB
    fields = []
    with connection.cursor() as cursor:
        cursor.execute(f'SELECT * FROM {model_class._meta.db_table} LIMIT 1')
        fields = [col[0] for col in cursor.description]

    # Dynamically create serializer
    serializer_attrs = {field: serializers.ReadOnlyField() for field in fields}
    return type(
        'DynamicContextLayerSerializer',
        (DynamicModelSerializer,),
        {
            'Meta': type(
                'Meta', (), {'model': model_class, 'fields': '__all__'}
            )
        }
    )
