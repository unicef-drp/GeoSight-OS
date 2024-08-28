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

from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.generic.base import RedirectView
from drf_yasg import openapi
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from core.api.access_request import (
    AccessRequestList, AccessRequestDetail, AccessRequestCount
)
from core.api.color import ColorPaletteListAPI
from core.api.group import (
    GroupListAPI, GroupDetailAPI, GroupUpdateBatchUserAPI
)
from core.api.maintenance import MaintenanceAPI
from core.api.proxy import ProxyView
from core.api.sentry import trigger_error
from core.api.user import UserListAPI, UserDetailAPI, UserApiKey


class CustomSchemaGenerator(OpenAPISchemaGenerator):
    """Scheme generator of swagger."""

    def get_schema(self, request=None, public=False):
        """Return schema of swagger."""
        schema = super().get_schema(request, public)
        schema.schemes = ['https']
        if settings.DEBUG:
            schema.schemes = ['http'] + schema.schemes
        return schema


schema_view_v1 = get_schema_view(
    openapi.Info(
        title="GeoSight API",
        default_version='v1.0.0'
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    generator_class=CustomSchemaGenerator,
    patterns=[
        path(r'^api/v1/',
             include(('core.urls_v1', 'api'), namespace='v1'))
    ],
)
admin.autodiscover()

urlpatterns = [
    url(r'^django-admin/core/sitepreferences/$', RedirectView.as_view(
        url='/django-admin/core/sitepreferences/1/change/', permanent=False),
        name='index'),

    url(r'^', include('docs.urls')),
    url(r'^django-admin/', admin.site.urls),
    url(r'^api/v1/docs/$', schema_view_v1.with_ui(
        'swagger', cache_timeout=0),
        name='schema-swagger-ui'),
]

if settings.USE_AZURE:
    # azure auth
    urlpatterns += [
        path("", include("azure_auth.urls", namespace="azure_auth")),
    ]
else:
    urlpatterns += [
        url(r'^auth/', include('django.contrib.auth.urls')),
    ]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )

# ------------------------------------------------------
# USER API
user_api = [
    url(
        r'^list',
        UserListAPI.as_view(), name='user-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/token',
        UserApiKey.as_view(),
        name='user-api-key'
    ),
    url(
        r'^(?P<pk>\d+)',
        UserDetailAPI.as_view(), name='user-detail-api'
    ),
]
# GROUP API
group_api = [
    url(
        r'^list',
        GroupListAPI.as_view(), name='group-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/batch-update-user',
        GroupUpdateBatchUserAPI.as_view(), name='group-batch-update-user-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        GroupDetailAPI.as_view(), name='group-detail-api'
    ),
]
# COLOR API
color_api = [
    url(
        r'^list',
        ColorPaletteListAPI.as_view(), name='color-list-api'
    ),
]
# Request Access
request_access_api = [
    url(
        r'^request/'
        r'(?P<request_type>(user|permission))/'
        r'list/?$',
        AccessRequestList.as_view(),
        name='access-request-list-api'
    ),
    url(
        r'^request/(?P<pk>\d+)$',
        AccessRequestDetail.as_view(),
        name='access-request-detail-api'
    ),
    url(
        r'^request/count$',
        AccessRequestCount.as_view(),
        name='access-request-count-api'
    ),
]

api = [
    url(r'^maintenance$', MaintenanceAPI.as_view(), name='maintenance-view'),
    url(r'^color/palette/', include(color_api)),
    url(r'^group/', include(group_api)),
    url(r'^user/', include(user_api)),
    url(r'^user/', include(user_api)),
    url(r'^access/', include(request_access_api)),
]

# Tenants enabled
if settings.TENANTS_ENABLED:
    urlpatterns += [
        url(r'^tenants/', include('geosight.tenants.urls'))
    ]

urlpatterns += [
    url(r'^tinymce/', include('tinymce.urls')),
    url(r'^proxy', ProxyView.as_view(), name='proxy-view'),
    url(r'^api/v1/', include('core.urls_v1')),
    url(r'^api/', include(api)),
    url(r'^sentry-debug', trigger_error),
    url(r'^captcha/', include('captcha.urls')),
    url(r'^', include('geosight.urls')),
    url(r'^', include('frontend.urls')),
]
