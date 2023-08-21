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

from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, reverse, render

from frontend.views.admin.style.create import BaseStyleEditingView
from geosight.data.forms.style import StyleForm
from geosight.data.models.style import Style
from geosight.permission.access import (
    RoleContributorRequiredMixin
)

User = get_user_model()


class StyleEditView(RoleContributorRequiredMixin, BaseStyleEditingView):
    """Style Edit View."""

    template_name = 'frontend/admin/style/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Style'

    @property
    def content_title(self):
        """Return content title that used on page title style."""
        style = get_object_or_404(
            Style, pk=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-style-list-view')
        edit_url = reverse('admin-style-edit-view', args=[style.id])
        return (
            f'<a href="{list_url}">Styles</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{style.__str__()}</a> '
        )

    @property
    def style(self):
        """Return style."""
        return get_object_or_404(Style, pk=self.kwargs.get('pk', ''))

    def post(self, request, **kwargs):
        """Edit style."""
        style = get_object_or_404(Style, pk=self.kwargs.get('pk', ''))
        data = self.data
        form = StyleForm(data, instance=style)
        if form.is_valid():
            instance = form.save()
            self.post_save(style=instance, data=request.POST)
            return redirect(
                reverse(
                    'admin-style-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        form.instance_data = json.dumps(
            StyleForm.model_to_initial(form.instance))

        permission = style.permission.all_permission(self.request.user)
        context['permission'] = permission
        context['form'] = form
        return render(request, self.template_name, context)


class StyleEditBatchView(
    RoleContributorRequiredMixin, BaseStyleEditingView
):
    """Style Edit Batch View."""

    template_name = 'frontend/admin/style/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Batch Style'

    @property
    def content_title(self):
        """Return content title that used on page title style."""
        list_url = reverse('admin-style-list-view')
        return (
            f'<a href="{list_url}">Styles</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['batch'] = True
        return context

    def post(self, request, **kwargs):
        """Edit style."""
        data = request.POST.copy()
        ids = data.get('ids', None)
        if not ids:
            return HttpResponseBadRequest('ids needs in payload')
        ids = ids.split(',')
        for obj in Style.permissions.edit(request.user).filter(id__in=ids):
            # Save style if it has style on payload
            initial_data = model_to_dict(obj)
            for key, value in data.items():
                initial_data[key] = value
            form = StyleForm(initial_data, instance=obj)
            form.is_valid()
            instance = form.instance
            instance.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
        return redirect(reverse('admin-style-list-view'))
