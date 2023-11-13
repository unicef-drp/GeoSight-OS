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

import json

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, reverse

from azure_auth.backends import AzureAuthRequiredMixin
from frontend.views.dashboard._base import BaseDashboardView
from geosight.data.forms.dashboard import DashboardForm
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.style.base import DynamicClassificationTypeChoices
from geosight.permission.access import (
    edit_permission_resource,
    RoleContributorRequiredMixin
)


class DashboardEditView(
    AzureAuthRequiredMixin, RoleContributorRequiredMixin, BaseDashboardView
):
    """Dashboard Edit View."""

    template_name = 'frontend/admin/dashboard/editor.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Project'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        dashboard = get_object_or_404(
            Dashboard, slug=self.kwargs.get('slug', '')
        )
        list_url = reverse('admin-dashboard-list-view')
        edit_url = reverse('admin-dashboard-edit-view', args=[dashboard.slug])
        return (
            f'<a href="{list_url}">Projects</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{dashboard.__str__()}</a> '
        )

    @property
    def header_title(self):
        """Return content title that will be show on the header."""
        dashboard = get_object_or_404(
            Dashboard, slug=self.kwargs.get('slug', '')
        )
        return dashboard.name

    def get_context_data(self, slug, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        dashboard = get_object_or_404(
            Dashboard, slug=slug
        )
        edit_permission_resource(dashboard, self.request.user)
        context['dashboard'] = {'id': dashboard.slug}
        context['dynamicClassification'] = json.dumps(
            DynamicClassificationTypeChoices
        )
        return context

    def post(self, request, slug, **kwargs):
        """Create dashboard."""
        data = DashboardForm.update_data(request.POST.copy().dict())
        dashboard = get_object_or_404(
            Dashboard, slug=slug
        )
        edit_permission_resource(dashboard, self.request.user)
        if dashboard.name_is_exist(data['slug']):
            return HttpResponseBadRequest(
                f'Dashboard with this url shortcode : {data["slug"]} '
                f'is exist. Please choose other url shortcode.'
            )

        data['creator'] = dashboard.creator
        form = DashboardForm(
            data, request.FILES, instance=dashboard
        )
        if form.is_valid():
            try:
                dashboard = form.save()
                dashboard.save_relations(data)
                dashboard.increase_version()
                return redirect(
                    reverse(
                        'admin-dashboard-edit-view', args=[dashboard.slug]
                    )
                )
            except KeyError as e:
                return HttpResponseBadRequest(f'{e} is required')
            except ValueError as e:
                return HttpResponseBadRequest(e)
        else:
            errors = [
                key + ' : ' + ''.join(value) for key, value in
                form.errors.items()
            ]
            return HttpResponseBadRequest('<br>'.join(errors))
