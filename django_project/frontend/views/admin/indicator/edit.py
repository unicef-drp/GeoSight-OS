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

from django.shortcuts import get_object_or_404, redirect, reverse, render

from core.utils import string_is_true
from frontend.views.admin._base import AdminBatchEditView
from frontend.views.admin.indicator.create import BaseIndicatorEditView
from geosight.data.forms.indicator import IndicatorForm
from geosight.data.models.indicator import Indicator
from geosight.permission.access import (
    edit_permission_resource, RoleContributorRequiredMixin
)


class IndicatorEditView(RoleContributorRequiredMixin, BaseIndicatorEditView):
    """Indicator Edit View."""

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Indicator'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        indicator = self.indicator
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse('admin-indicator-edit-view', args=[indicator.id])
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{indicator.__str__()}</a> '
        )

    @property
    def indicator(self):
        """Return indicator."""
        return get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        edit_permission_resource(self.indicator, self.request.user)
        context['indicator_id'] = self.indicator.id
        context['id'] = self.indicator.id
        return context

    def post(self, request, **kwargs):
        """Edit indicator."""
        save_as = string_is_true(request.GET.get('save-as', False))
        data = self.data
        if save_as:
            form = IndicatorForm(data)
        else:
            indicator = get_object_or_404(
                Indicator, id=self.kwargs.get('pk', '')
            )
            edit_permission_resource(indicator, self.request.user)
            form = IndicatorForm(
                data,
                instance=indicator
            )
        if form.is_valid():
            indicator = form.save()
            if save_as and not indicator.creator:
                indicator.creator = request.user
                indicator.save()

            self.post_save(indicator=indicator, data=data)

            # Save permission
            indicator.permission.update_from_request_data(
                data, request.user
            )
            indicator.update_dashboard_version()
            return redirect(
                reverse(
                    'admin-indicator-edit-view', kwargs={'pk': indicator.id}
                ) + '?success=true'
            )

        context = self.get_context_data(**kwargs)
        form.indicator_data = json.dumps(
            IndicatorForm.model_to_initial(form.instance)
        )
        if data.get('permission', None):
            form.permission_data = data.get('permission', None)
        context['form'] = form
        return render(request, self.template_name, context)


class IndicatorEditBatchView(
    AdminBatchEditView, BaseIndicatorEditView
):
    """Indicator Edit Batch View."""

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Batch Indicator'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-indicator-list-view')
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    @property
    def edit_query(self):
        """Return query for edit."""
        return Indicator.permissions.edit(self.request.user)

    @property
    def form(self):
        """Return form."""
        return IndicatorForm

    @property
    def redirect_url(self):
        """Return redirect url."""
        return reverse('admin-indicator-list-view')

    def pre_update_data(self, data):
        """Pre update data."""
        if data.get('aggregation_upper_level_allowed', None):
            data['aggregation_upper_level_allowed'] = string_is_true(
                data.get('aggregation_upper_level_allowed', 'False')
            )

    def post_update_instance(self, instance, data, request):
        """Called when instance is saved."""
        # Save permission
        self.post_save(
            indicator=instance, data=data,
            save_style=data.get('style_config_enable', None),
            clean_update_permission=False
        )
