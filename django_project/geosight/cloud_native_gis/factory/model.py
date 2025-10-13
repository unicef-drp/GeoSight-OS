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

from cloud_native_gis.models.layer import Layer
from django.contrib.gis.db import models

from geosight.cloud_native_gis.factory.queryset import get_columns_with_types


def model_factory(layer: Layer):
    """
    Dynamically generate a Django model class for a cloud-native GIS layer.

    This factory function creates a Django model that maps directly to
    the database table associated with the given :class:`Layer` instance.
    It inspects the schema and table name from the layer and uses its
    attribute names to define the model fields dynamically.

    The generated model:
      - Is **unmanaged** (not affected by migrations)
      - Uses the layer's schema and table as its `db_table`
      - Treats the first attribute as the primary key (if any)

    :param layer: The cloud-native GIS layer used to generate the model.
    :type layer: cloud_native_gis.models.layer.Layer
    :return: A dynamically generated Django model mapped to the layer’s table.
    :rtype: type[django.db.models.Model]
    """
    schema_name = layer.schema_name
    table_name = layer.table_name
    full_table = f'"{schema_name}"."{table_name}"'
    model_name = f"Dynamic_{schema_name}_{table_name}".replace('.', '_')
    columns = get_columns_with_types(layer)

    primary_key_col = columns[0]['name'] if columns else None

    attrs = {
        '__module__': __name__,
        'Meta': type('Meta', (), {
            'managed': False,
            'db_table': full_table,
            'auto_created': True,
        }),
    }

    for col in columns:
        name = col['name']
        col_type = col.get('type', 'text').lower()

        field_kwargs = {}
        if name == primary_key_col:
            field_kwargs['primary_key'] = True

        if col_type in (
                'geometry', 'point', 'polygon', 'linestring',
                'multipoint', 'multipolygon'
        ):
            field_cls = models.GeometryField
        elif col_type in ('integer', 'bigint', 'smallint'):
            field_cls = models.IntegerField
        elif col_type in ('numeric', 'decimal', 'double precision', 'real'):
            field_cls = models.FloatField
        elif col_type in (
                'timestamp', 'timestamp without time zone',
                'timestamp with time zone'
        ):
            field_cls = models.DateTimeField
        elif col_type == 'date':
            field_cls = models.DateField
        elif col_type == 'time':
            field_cls = models.TimeField
        else:
            field_cls = models.TextField

        attrs[name] = field_cls(db_column=name, **field_kwargs)

    return type(model_name, (models.Model,), attrs)
