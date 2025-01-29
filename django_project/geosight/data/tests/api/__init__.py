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

from .arcgis import ARCGISProxyApiTest  # noqa
from .basemap import BasemapListApiTest  # noqa
from .context_layer import *  # noqa
from .dashboard import DashboardListApiTest  # noqa
from .dashboard_bookmark import DashboardBookmarkApiTest  # noqa
from .dashboard_embed import DashboardBookmarkApiTest  # noqa
from .indicator import *  # noqa
from .indicator_value import IndicatorValueTest  # noqa
from .indicators import IndicatorListApiTest  # noqa
from .related_table import RelatedTableApiTest  # noqa
from .sharepoint import *  # noqa
from .style import StyleApiTest  # noqa
from .v1 import *  # noqa
