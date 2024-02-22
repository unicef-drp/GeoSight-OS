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
__date__ = '13/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf import settings
from django.core.files.temp import NamedTemporaryFile
from fiona.collection import Collection

import fiona

GEOJSON = 'GEOJSON'
SHAPEFILE = 'SHAPEFILE'
GEOPACKAGE = 'GEOPACKAGE'


def check_layer_type(filename: str) -> str:
    """Check layer type."""
    if (filename.lower().endswith('.geojson') or
            filename.lower().endswith('.json')):
        return GEOJSON
    elif filename.lower().endswith('.zip'):
        return SHAPEFILE
    elif filename.lower().endswith('.gpkg'):
        return GEOPACKAGE
    return ''


def open_collection_by_file(fp, type: str) -> Collection:
    """Open collection by file."""
    result: Collection = None
    if settings.USE_AZURE:
        if type == SHAPEFILE:
            with (
                    NamedTemporaryFile(
                        delete=False,
                        suffix='.zip',
                        dir=getattr(settings, 'FILE_UPLOAD_TEMP_DIR', None)
                    )
            ) as temp_file:
                temp_file.write(fp.read())
                temp_file.flush()
            file_path = f'zip://{temp_file.name}'
        else:
            file_path = fp
    else:
        if type == SHAPEFILE:
            file_path = f'zip://{fp.path}'
        else:
            file_path = fp
    if file_path:
        result = fiona.open(file_path, encoding='utf-8')
    return result
