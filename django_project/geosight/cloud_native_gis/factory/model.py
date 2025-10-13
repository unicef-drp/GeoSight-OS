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
from django.db import models


def model_factory(layer: Layer):
    """Create model dynamically."""
    schema_name = layer.schema_name
    table_name = layer.table_name
    full_table = f'"{schema_name}"."{table_name}"'
    model_name = f"Dynamic_{schema_name}_{table_name}".replace('.', '_')
    columns = layer.attribute_names

    primary_key_col = columns[0] if columns else None

    attrs = {
        '__module__': __name__,
        'Meta': type('Meta', (), {
            'managed': False,
            'db_table': full_table,
            'auto_created': True,
        }),
    }

    for col in columns:
        if col == primary_key_col:
            attrs[col] = models.TextField(db_column=col, primary_key=True)
        else:
            attrs[col] = models.TextField(db_column=col)

    model = type(model_name, (models.Model,), attrs)
    return model
