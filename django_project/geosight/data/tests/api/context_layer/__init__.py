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
__date__ = '06/01/2025'
__copyright__ = ('Copyright 2023, Unicef')

from .cloud_native_gis import ContextLayerCloudNativeTest  # noqa
from .cloud_native_gis_api_flow import ContextLayerCloudNativeAPIFlowTest
from .cloud_native_gis_download import ContextLayerCloudNativeDownloadTest
from .cloud_native_zonal_analysis import TestCloudNativeZonalAnalysis  # noqa
from .raster_zonal_analysis import TestRasterZonalAnalysis  # noqa
from .resource_api import ContextLayerListApiTest  # noqa
