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

from django.db import transaction
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect, reverse

from azure_auth.backends import AzureAuthRequiredMixin
from frontend.views.dashboard._base import BaseDashboardView
from geosight.data.api.dashboard import CREATE_SLUG
from geosight.data.forms.dashboard import DashboardForm
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.style.base import DynamicClassificationTypeChoices
from geosight.permission.access import RoleCreatorRequiredMixin


class DashboardCreateView(
    AzureAuthRequiredMixin, RoleCreatorRequiredMixin, BaseDashboardView
):
    """Dashboard Detail View."""

    template_name = 'frontend/admin/dashboard/editor.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Project'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-dashboard-list-view')
        create_url = reverse('admin-dashboard-create-view')
        return (
            f'<a href="{list_url}">Projects</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['dashboard'] = {'id': CREATE_SLUG}
        context['dynamicClassification'] = json.dumps(
            DynamicClassificationTypeChoices
        )
        return context

    def post(self, request, **kwargs):
        """Create dashboard."""
        data = DashboardForm.update_data(
            request.POST.copy().dict()
        )
        if Dashboard.name_is_exist_of_all(data['slug']):
            return HttpResponseBadRequest(
                f'Dashboard with this url shortcode : {data["slug"]} '
                f'is exist. Please choose other url shortcode.'
            )

        data['creator'] = request.user
        form = DashboardForm(data, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    dashboard = form.save()
                    dashboard.save_relations(data)
                    return redirect(
                        reverse(
                            'admin-dashboard-edit-view',
                            args=[dashboard.slug]
                        )
                    )
            except Exception as e:
                return HttpResponseBadRequest(e)
        else:
            errors = [
                key + ' : ' + ''.join(value) for key, value in
                form.errors.items()
            ]
            return HttpResponseBadRequest('<br>'.join(errors))
