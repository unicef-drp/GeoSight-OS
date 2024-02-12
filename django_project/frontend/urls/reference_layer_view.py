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

from django.conf.urls import url

from frontend.views.admin.reference_layer_view.create import (
    ReferenceLayerViewUploaderView
)

admin_detail_url = [
]
urlpatterns = [
    url(
        r'^create',
        ReferenceLayerViewUploaderView.as_view(),
        name='admin-boundary-create-view'
    ),
]
