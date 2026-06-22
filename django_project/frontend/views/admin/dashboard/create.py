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

from django.http import HttpResponseBadRequest
from django.shortcuts import redirect, reverse

from azure_auth.backends import AzureAuthRequiredMixin
from frontend.views.dashboard._base import BaseDashboardView
from geosight.data.services.dashboard_create import (
    create_dashboard_from_payload
)
from geosight.permission.access import RoleCreatorRequiredMixin


class DashboardCreateViewBase:
    """Dashboard create view base View."""

    def save(self, data, user, files):
        """
        Save a new dashboard instance.

        :param dict data: Dashboard data from the request.
        :param User user: The user creating the dashboard.
        :param files: Uploaded files from the request.
        :type files: MultiValueDict or dict
        :return: Redirect to the dashboard edit page if successful,
            otherwise an HTTP bad request response.
        :rtype: HttpResponseRedirect or HttpResponseBadRequest
        """
        result = create_dashboard_from_payload(data, user, files)
        if result.dashboard:
            return redirect(
                reverse(
                    'admin-dashboard-edit-view',
                    args=[result.dashboard.slug]
                )
            )

        if result.form_errors:
            errors = [
                key + ' : ' + ''.join(value) for key, value in
                result.form_errors.items()
            ]
            return HttpResponseBadRequest('<br>'.join(errors))

        return HttpResponseBadRequest(result.error)


class DashboardCreateView(
    AzureAuthRequiredMixin, RoleCreatorRequiredMixin, BaseDashboardView,
    DashboardCreateViewBase
):
    """Dashboard Detail View."""

    template_name = 'frontend/admin/dashboard/editor.html'

    @property
    def page_title(self):
        """
        Return the page title used on the browser tab bar.

        :return: The page title string.
        :rtype: str
        """
        return 'Create Project'

    @property
    def content_title(self):
        """
        Return the content title displayed on the page title indicator.

        :return:
            HTML string containing breadcrumb-style links
            for the dashboard creation page.
        :rtype: str
        """
        list_url = reverse('admin-dashboard-list-view')
        create_url = reverse('admin-dashboard-create-view')
        return (
            f'<a href="{list_url}">Projects</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """
        Return context data for creating a dashboard.

        :param **kwargs: Extra keyword arguments passed from the base view.
        :type **kwargs: dict
        :return: Context data containing the placeholder dashboard slug.
        :rtype: dict
        """
        from geosight.data.api.dashboard import CREATE_SLUG
        context = super().get_context_data(**kwargs)
        context['dashboard'] = {'id': CREATE_SLUG}
        return context

    def post(self, request, **kwargs):
        """
        Handle POST request to create a new dashboard.

        :param request: The incoming HTTP request.
        :type request: HttpRequest
        :param **kwargs: Extra keyword arguments.
        :type **kwargs: dict
        :return: Redirect to the dashboard edit page if successful,
            otherwise an HTTP bad request response.
        :rtype: HttpResponseRedirect or HttpResponseBadRequest
        """
        return self.save(
            request.POST.copy().dict(), request.user, request.FILES
        )
