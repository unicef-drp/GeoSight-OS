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

from django.forms.models import model_to_dict
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, reverse, render

from core.utils import string_is_true
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
            indicator.permission.update_from_request_data_in_string(
                data, request.user
            )
            return redirect(
                reverse(
                    'admin-indicator-edit-view', kwargs={'pk': indicator.id}
                ) + '?success=true'
            )

        context = self.get_context_data(**kwargs)
        form.indicator_data = json.dumps(
            IndicatorForm.model_to_initial(form.instance)
        )
        context['form'] = form
        return render(request, self.template_name, context)


class IndicatorEditBatchView(
    RoleContributorRequiredMixin, BaseIndicatorEditView
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

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['batch'] = True
        return context

    def post(self, request, **kwargs):
        """Edit indicator."""
        data = request.POST.copy()
        ids = data.get('ids', None)
        if not ids:
            return HttpResponseBadRequest('ids needs in payload')
        ids = ids.split(',')
        if data.get('aggregation_upper_level_allowed', None):
            data['aggregation_upper_level_allowed'] = string_is_true(
                data.get('aggregation_upper_level_allowed', 'False')
            )
        for indicator in Indicator.permissions.edit(request.user).filter(
                id__in=ids
        ):
            # Save style if it has style on payload
            initial_data = model_to_dict(indicator)
            if indicator.group:
                initial_data['group'] = indicator.group.name
            for key, value in data.items():
                initial_data[key] = value
            form = IndicatorForm(initial_data, instance=indicator)
            form.is_valid()
            instance = form.instance
            instance.save()
            self.post_save(
                indicator=indicator, data=data,
                save_style=data.get('style_config_enable', None)
            )
        return redirect(reverse('admin-indicator-list-view'))
