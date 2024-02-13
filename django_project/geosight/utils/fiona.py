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

import os

from django.conf import settings
from django.core.files.temp import NamedTemporaryFile
from fiona.collection import Collection

import fiona

GEOJSON = 'GEOJSON'
SHAPEFILE = 'SHAPEFILE'
GEOPACKAGE = 'GEOPACKAGE'


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
        print(file_path)
        result = fiona.open(file_path, encoding='utf-8')
    return result


def delete_tmp_shapefile(file_path: str, azure_only=True):
    """Delete temporary shapefile."""
    check_azure = settings.USE_AZURE
    if not azure_only:
        check_azure = True
    if check_azure and file_path.endswith('.zip'):
        cleaned_fp = file_path
        if '/vsizip/' in file_path:
            cleaned_fp = file_path.replace('/vsizip/', '')
        if os.path.exists(cleaned_fp):
            os.remove(cleaned_fp)
