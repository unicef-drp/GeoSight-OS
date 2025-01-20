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

from django.conf.urls import url
from django.urls import include

from geosight.data.api.arcgis import arcgis_proxy_request
from geosight.data.api.basemap import (
    BasemapListAPI, BasemapDetailAPI
)
from geosight.data.api.context_layers import (
    ContextLayerListAPI, ContextLayerDetailAPI, ContextLayerZonalAnalysisAPI
)
from geosight.data.api.dashboard import (
    DashboardData, DashboardDuplicate, DashboardDetail, DashboardListAPI
)
from geosight.data.api.dashboard_bookmark import (
    DashboardBookmarksAPI,
    DashboardBookmarkCreateAPI,
    DashboardBookmarkDetailAPI
)
from geosight.data.api.dashboard_embed import DashboardEmbedAPI
from geosight.data.api.dashboard_indicator_layer import (
    DashboardIndicatorLayerAPI
)
from geosight.data.api.dashboard_indicator_value import (
    DashboardIndicatorValuesAPI, DashboardIndicatorDatesAPI,
    DashboardIndicatorAllValuesAPI,
    DashboardIndicatorValueListAPI, DashboardEntityDrilldown
)
from geosight.data.api.download_file import (
    DownloadSharepointFile,
    DownloadBackupsFile
)
from geosight.data.api.indicator import (
    IndicatorListAPI, IndicatorAdminListAPI,
    IndicatorDetailAPI, IndicatorValuesAPI, SearchSimilarityIndicatorAPI,
    IndicatorMetadataAPI
)
from geosight.data.api.indicator_reference_layer import (
    IndicatorBatchMetadataAPI
)
from geosight.data.api.indicator_value import (
    IndicatorValuesByGeometry,
    IndicatorValueDetail,
    IndicatorValueListAPI,
    IndicatorValueValuesAPI,
)
from geosight.data.api.related_table import (
    RelatedTableListAPI, RelatedTableDetailAPI, RelatedTableDataAPI,
    RelatedTableDatesAPI, RelatedTableValuesAPI, RelatedTableFieldDataAPI
)
from geosight.data.api.sharepoint import (
    SharepointConfigListAPI, SharepointInformationAPI
)
from geosight.data.api.style import (
    StyleListAPI,
    StyleDetailAPI,
    GetRasterClassificationAPI
)

# ------------------------------------------------------
dashboard_specific_api = [
    url(
        r'^data$',
        DashboardData.as_view(),
        name='dashboard-data-api'
    ),
    url(
        r'^duplicate$',
        DashboardDuplicate.as_view(),
        name='dashboard-duplicate-api'
    ),
    url(
        r'^entity/(?P<concept_uuid>[^/]+)/drilldown$',
        DashboardEntityDrilldown.as_view(),
        name='dashboard-entity-drilldown'
    ),
    url(
        r'^$',
        DashboardDetail.as_view(),
        name='dashboard-detail-api'
    ),

    # INDICATOR LAYER
    url(
        r'^indicator-layer/(?P<pk>\d+)$',
        DashboardIndicatorLayerAPI.as_view(),
        name='dashboard-indicator-layer-api'
    ),

    # INDICATOR VALUES
    url(
        r'^indicator/(?P<pk>\d+)/values/latest$',
        DashboardIndicatorValuesAPI.as_view(),
        name='dashboard-indicator-values-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)/values/all$',
        DashboardIndicatorAllValuesAPI.as_view(),
        name='dashboard-indicator-values-all-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)/dates$',
        DashboardIndicatorDatesAPI.as_view(),
        name='dashboard-indicator-dates-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)/values$',
        DashboardIndicatorValueListAPI.as_view(),
        name='dashboard-indicator-values-list-api'
    ),

    # BOOKMARKS
    url(
        r'^bookmarks/create',
        DashboardBookmarkCreateAPI.as_view(),
        name='dashboard-bookmarks-create'
    ),
    url(
        r'^bookmarks/(?P<pk>\d+)',
        DashboardBookmarkDetailAPI.as_view(),
        name='dashboard-bookmarks-detail'
    ),
    url(
        r'^bookmarks',
        DashboardBookmarksAPI.as_view(),
        name='dashboard-bookmarks'
    ),
    url(
        r'^embed',
        DashboardEmbedAPI.as_view(),
        name='dashboard-embed'
    ),
]
# DASHBOARD API
dashboard_api = [
    url(
        r'^list',
        DashboardListAPI.as_view(), name='dashboard-list-api'
    ),
    url(r'^(?P<slug>[^/]+)/', include(dashboard_specific_api)),
]
# ------------------------------------------------------
# INDICATOR API
indicator_api = [
    url(
        r'^list/basic',
        IndicatorAdminListAPI.as_view(), name='indicator-basic-list-api'
    ),
    url(
        r'^list/admin',
        IndicatorAdminListAPI.as_view(), name='indicator-admin-list-api'
    ),
    url(
        r'^list',
        IndicatorListAPI.as_view(), name='indicator-list-api'
    ),
    url(
        r'^search/similarity',
        SearchSimilarityIndicatorAPI.as_view(),
        name='indicator-search-similarity-api'
    ),
    url(
        r'^metadata',
        IndicatorBatchMetadataAPI.as_view(),
        name='indicator-metadata-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/latest',
        IndicatorValuesAPI.as_view(), name='indicator-values-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/by-geometry/(?P<geometry_code>.+)$',
        IndicatorValuesByGeometry.as_view(),
        name='indicator-values-by-geometry'
    ),
    url(
        r'^(?P<pk>\d+)/values/(?P<value_id>\d+)/details$',
        IndicatorValueDetail.as_view(),
        name='indicator-value-detail'
    ),
    url(
        r'^(?P<pk>\d+)/values/flat/',
        IndicatorValueValuesAPI.as_view(),
        name='indicator-values-flat-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/',
        IndicatorValueListAPI.as_view(), name='indicator-values-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/detail',
        IndicatorDetailAPI.as_view(), name='indicator-detail-api'
    ),
    url(
        r'^(?P<pk>\d+)/metadata',
        IndicatorMetadataAPI.as_view(), name='indicator-metadata-api'
    ),
]
# ------------------------------------------------------
# BASEMAP API
basemap_api = [
    url(
        r'^list',
        BasemapListAPI.as_view(), name='basemap-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        BasemapDetailAPI.as_view(), name='basemap-detail-api'
    ),
]
# ------------------------------------------------------
# STYLE
style_api = [
    url(
        r'^list',
        StyleListAPI.as_view(), name='style-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        StyleDetailAPI.as_view(), name='style-detail-api'
    ),
    url(
        (r'^raster-classification/(?P<class_type>[a-zA-Z0-9_-]+)/'
         r'(?P<class_number>[a-zA-Z0-9_-]+)'),
        GetRasterClassificationAPI.as_view(), name='raster-classification-api'
    ),
]
# ------------------------------------------------------
# CONTEXT LAYER API
context_layer_api = [
    url(
        r'^list',
        ContextLayerListAPI.as_view(), name='context-layer-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/zonal-analysis/(?P<aggregation>[a-zA-Z0-9_-]+)',
        ContextLayerZonalAnalysisAPI.as_view(),
        name='context-layer-zonal-analysis'
    ),
    url(
        r'^(?P<pk>\d+)',
        ContextLayerDetailAPI.as_view(), name='context-layer-detail-api'
    )
]
# ------------------------------------------------------
# RELATED TABLE API
related_table_api = [
    url(
        r'^list',
        RelatedTableListAPI.as_view(), name='related-table-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/data',
        RelatedTableDataAPI.as_view(), name='related-table-data-api'
    ),
    url(
        r'^(?P<pk>\d+)/dates',
        RelatedTableDatesAPI.as_view(), name='related-table-dates-api'
    ),
    url(
        r'^(?P<pk>\d+)/field/data',
        RelatedTableFieldDataAPI.as_view(), name='related-table-field-data-api'
    ),
    url(
        r'^(?P<pk>\d+)/values',
        RelatedTableValuesAPI.as_view(), name='related-table-values-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        RelatedTableDetailAPI.as_view(), name='related-table-detail-api'
    ),
]
# ------------------------------------------------------
# SHAREPOINT API
sharepoint_api = [
    url(
        r'^list',
        SharepointConfigListAPI.as_view(), name='sharepoint-config-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/info',
        SharepointInformationAPI.as_view(), name='sharepoint-fetch-info-api'
    ),
]
# ------------------------------------------------------
# ARCGIS API
arcgis_api = [
    url(
        r'^(?P<pk>\d+)/proxy$',
        arcgis_proxy_request, name='arcgis-config-proxy'
    ),
]
# ------------------------------------------------------
api = [
    url(r'^dashboard/', include(dashboard_api)),
    url(r'^basemap/', include(basemap_api)),
    url(r'^indicator/', include(indicator_api)),
    url(r'^context-layer/', include(context_layer_api)),
    url(r'^style/', include(style_api)),
    url(r'^permission/', include('geosight.permission.urls')),
    url(r'^related-table/', include(related_table_api)),
    url(r'^sharepoint/', include(sharepoint_api)),
    url(r'^arcgis/', include(arcgis_api)),
]

download = [
    url(
        r'^sharepoint',
        DownloadSharepointFile.as_view(),
        name='download-sharepoint'
    ),
    url(
        r'^backups',
        DownloadBackupsFile.as_view(),
        name='download-backups'
    ),
]
urlpatterns = [
    url(r'^download/', include(download)),
    url(r'^api/', include(api)),
]
