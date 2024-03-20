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

from django.conf.urls import url, include

from frontend.views.admin.reference_layer_view.create import (
    ReferenceLayerViewCreateView
)
from frontend.views.admin.reference_layer_view.edit import (
    ReferenceLayerViewEditView
)
from frontend.views.admin.reference_layer_view.entity_browser import (
    ReferenceLayerViewEntityListView
)
from frontend.views.admin.reference_layer_view.importer_form import (
    ReferenceLayerViewImportDataView
)
from frontend.views.admin.reference_layer_view.importer_list import (
    ReferenceLayerViewImporterListView
)
from frontend.views.admin.reference_layer_view.list import (
    ReferenceLayerViewListView
)

admin_detail_url = [
    url(
        r'^import-data/(?P<pk>\d+)',
        ReferenceLayerViewImportDataView.as_view(),
        name='admin-reference-layer-view-import-data-edit-view'
    ),
    url(
        r'^import-data',
        ReferenceLayerViewImportDataView.as_view(),
        name='admin-reference-layer-view-import-data-view'
    ),
    url(
        r'^edit',
        ReferenceLayerViewEditView.as_view(),
        name='admin-reference-layer-view-edit-view'
    ),
    url(
        r'^entities',
        ReferenceLayerViewEntityListView.as_view(),
        name='admin-reference-layer-view-entity-list-view'
    ),
]
urlpatterns = [
    url(r'^(?P<identifier>[^/]+)/', include(admin_detail_url)),
    url(
        r'^importer',
        ReferenceLayerViewImporterListView.as_view(),
        name='admin-reference-layer-view-importer-list-view'
    ),
    url(
        r'^create',
        ReferenceLayerViewCreateView.as_view(),
        name='admin-reference-layer-view-create-view'
    ),
    url(
        r'^',
        ReferenceLayerViewListView.as_view(),
        name='admin-reference-layer-view-list-view'
    ),
]
