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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.conf.urls import url
from django.contrib import admin
from django.views.generic.base import RedirectView

from docs.api.documentation import DocumentationDetail

admin.autodiscover()

urlpatterns = [
    url(
        r'^django-admin/docs/preferences/$',
        RedirectView.as_view(
            url='/django-admin/docs/preferences/1/change/',
            permanent=False),
        name='index'
    ),
    url(
        r'^docs/(?P<page_name>[^/]+)/data',
        DocumentationDetail.as_view(),
        name='documentation-detail'
    )
]
