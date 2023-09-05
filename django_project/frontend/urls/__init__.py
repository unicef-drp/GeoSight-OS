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

from frontend.views.arcgis_callback import ArcGisCallbackView
from frontend.views.georepo_auth_failed import GeoRepoAuthFailedPageView
from frontend.views.home import HomePageView
from frontend.views.login import LoginPageView
from frontend.views.sign_up import SignUpView

admin_url = [
    url(r'^access/', include('frontend.urls.access_request')),
    url(r'^project/', include('frontend.urls.dashboard_admin')),
    url(r'^indicators/', include('frontend.urls.indicator')),
    url(r'^basemap/', include('frontend.urls.basemap')),
    url(r'^context-layer/', include('frontend.urls.context_layer')),
    url(r'^style/', include('frontend.urls.style')),
    url(r'^user/', include('frontend.urls.user')),
    url(r'^group/', include('frontend.urls.group')),
    url(r'^user-and-group/', include('frontend.urls.user_and_group')),
    url(r'^dataset/', include('frontend.urls.dataset')),
    url(r'^related-table/', include('frontend.urls.related_table')),
    url(r'^importer/', include('frontend.urls.importer')),
]
urlpatterns = [
    url(r'^embed/', include('frontend.urls.embed')),
    url(r'^project/', include('frontend.urls.dashboard')),
    url(r'^login/', LoginPageView.as_view(), name='login'),
    url(r'^sign-up/$', SignUpView.as_view(), name='signup-view'),
    url(r'^georepo_auth_failed/', GeoRepoAuthFailedPageView.as_view(),
        name='georepo_auth_failed'),
    url(r'^admin/', include(admin_url)),
    url(r'^arcgis-callback', ArcGisCallbackView.as_view()),
    url(r'^$', HomePageView.as_view(), name='home-view'),
]
