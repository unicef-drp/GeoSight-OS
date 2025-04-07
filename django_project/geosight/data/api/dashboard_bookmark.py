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

from django.db import transaction
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import (
    RoleContributorAuthenticationPermission
)
from geosight.data.forms.dashboard_bookmark import DashboardBookmarkForm
from geosight.data.models.dashboard import (
    Dashboard, DashboardBookmark
)
from geosight.data.serializer.dashboard_bookmark import (
    DashboardBookmarkSerializer
)
from geosight.permission.access import edit_permission_resource


class DashboardBookmarksAPI(APIView):
    """Return Dashboard Bookmark list."""

    def get(self, request, slug):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        first_layer = dashboard.dashboardindicatorlayer_set.filter(
            visible_by_default=True).first()
        # default data
        basemap = dashboard.dashboardbasemap_set.filter(
            visible_by_default=True
        ).first()

        level_config = dashboard.level_config
        default_level = None
        try:
            default_level = level_config['default_level']
        except KeyError:
            pass
        selected_indicator_layers = []
        if first_layer:
            selected_indicator_layers = [first_layer.id]
        default = DashboardBookmarkSerializer(
            DashboardBookmark(
                id=0,
                name='Default',
                extent=dashboard.extent,
                selected_basemap=basemap.object if basemap else None,
                selected_indicator_layers=selected_indicator_layers,
                selected_admin_level=default_level,
                filters=dashboard.filters
            )
        ).data

        context_layers = dashboard.dashboardcontextlayer_set
        default['selected_context_layers'] = context_layers.filter(
            visible_by_default=True
        ).values_list('object__id', flat=True)

        data = [default] + DashboardBookmarkSerializer(
            dashboard.dashboardbookmark_set, many=True
        ).data
        return Response(data)


class _DashboardBookmarkAPI(APIView):
    """Return Dashboard Bookmark detail."""

    def update_bookmark_data(self, request, dashboard):
        """Update Bookmark Data."""
        try:
            data = DashboardBookmarkForm.update_data(
                request.data.copy(), dashboard
            )
        except ValueError as e:
            return HttpResponseBadRequest(e)
        if request.user.is_authenticated:
            data['creator'] = request.user
        return data

    def save_bookmark(self, request, dashboard, bookmark):
        """Save bookmark."""
        data = self.update_bookmark_data(request, dashboard)
        if not isinstance(data, dict):
            return data

        form = DashboardBookmarkForm(data, instance=bookmark)
        if form.is_valid():
            try:
                with transaction.atomic():
                    dashboard = form.save()
                    dashboard.save_relations(data)
                    return Response(
                        DashboardBookmarkSerializer(dashboard).data
                    )
            except Exception as e:
                return HttpResponseBadRequest(e)
        else:
            errors = [''.join(value) for key, value in form.errors.items()]
            return HttpResponseBadRequest('<br>'.join(errors))


class DashboardBookmarkDetailAPI(_DashboardBookmarkAPI):
    """Return Dashboard Bookmark detail."""

    permission_classes = (IsAuthenticated,)

    def post(self, request, slug, pk):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        try:
            bookmark = dashboard.dashboardbookmark_set.get(id=pk)
        except DashboardBookmark.DoesNotExist:
            return HttpResponseBadRequest('Bookmark does not exist')
        if not bookmark.able_to_edit(request.user):
            return HttpResponseForbidden()

        return self.save_bookmark(request, dashboard, bookmark)

    def delete(self, request, slug, pk):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        try:
            bookmark = dashboard.dashboardbookmark_set.get(id=pk)
        except DashboardBookmark.DoesNotExist:
            return HttpResponseBadRequest('Bookmark does not exist')
        if not bookmark.able_to_edit(request.user):
            return HttpResponseForbidden()
        bookmark.delete()
        return Response('Deleted')


class DashboardBookmarkCreateAPI(_DashboardBookmarkAPI):
    """Return all dashboard data."""

    permission_classes = (
        IsAuthenticated, RoleContributorAuthenticationPermission
    )

    def post(self, request, slug):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        edit_permission_resource(dashboard, request.user)
        return self.save_bookmark(request, dashboard, None)
