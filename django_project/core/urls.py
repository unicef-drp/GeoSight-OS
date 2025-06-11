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
from django.conf.urls.i18n import i18n_patterns
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
from core.api.maintenance import MaintenanceAPI
from core.api.proxy import ProxyView
from core.api.refresh_materialized_view import RefreshMaterializedViewApi
from core.api.sentry import trigger_error
from core.api.user import UserApiKey


class CustomSchemaGenerator(OpenAPISchemaGenerator):
    """Scheme generator of swagger."""

    def get_schema(self, request=None, public=False):  # noqa DOC101
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
    url(r'^i18n/', include('django.conf.urls.i18n')),
]

urlpatterns += i18n_patterns(
    url(r'^django-admin/core/sitepreferences/$', RedirectView.as_view(
        url='/django-admin/core/sitepreferences/1/change/', permanent=False),
        name='index'),

    url(r'^', include('docs.urls')),
    url(r'^django-admin/', admin.site.urls),
    url(r'^api/v1/docs/$', schema_view_v1.with_ui(
        'swagger', cache_timeout=0),
        name='schema-swagger-ui'),
)

if settings.USE_AZURE:
    # azure auth
    urlpatterns += (
        path("", include("azure_auth.urls", namespace="azure_auth")),
    )
else:
    urlpatterns += (
        url(r'^auth/', include('django.contrib.auth.urls')),
    )

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )

# ------------------------------------------------------
# USER API
user_api = [
    url(
        r'^(?P<pk>\d+)/token',
        UserApiKey.as_view(),
        name='user-api-key'
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
    url(r'^user/', include(user_api)),
    url(r'^user/', include(user_api)),
    url(r'^access/', include(request_access_api)),
    url(
        r'^refresh-materialized-view$', RefreshMaterializedViewApi.as_view(),
        name='refresh-materialized-view'
    ),
]

# Tenants enabled
if settings.TENANTS_ENABLED:
    api += [
        url(r'^tenants/', include('geosight.tenants.urls'))
    ]

urlpatterns += (
    url(r'^tinymce/', include('tinymce.urls')),
    url(r'^proxy', ProxyView.as_view(), name='proxy-view'),
    url(r'^api/v1/', include('core.urls_v1')),
    url(r'^api/', include(api)),
    url(r'^sentry-debug', trigger_error),
    url(r'^captcha/', include('captcha.urls')),
    url(r'^', include('geosight.urls')),
)
urlpatterns += i18n_patterns(
    url(r'^', include('frontend.urls')),
)
