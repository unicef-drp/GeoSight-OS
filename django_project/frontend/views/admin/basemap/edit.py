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

from frontend.views.admin._base import AdminBaseView
from frontend.views.admin.basemap.create import BasemapCreateView
from geosight.data.forms.basemap import BasemapForm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.permission.access import (
    edit_permission_resource,
    RoleContributorRequiredMixin
)


class BasemapEditView(RoleContributorRequiredMixin, AdminBaseView):
    """Basemap Edit View."""

    template_name = 'frontend/admin/basemap/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Basemap'

    @property
    def content_title(self):
        """Return content title that used on page title basemap."""
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-basemap-list-view')
        edit_url = reverse('admin-basemap-edit-view', args=[basemap.id])
        return (
            f'<a href="{list_url}">Basemaps</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{basemap.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(basemap, self.request.user)
        permission = basemap.permission.all_permission(self.request.user)

        context.update(
            {
                'id': basemap.id,
                'form': BasemapForm(
                    initial=BasemapForm.model_to_initial(basemap)
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit basemap."""
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(basemap, self.request.user)
        form = BasemapForm(
            request.POST,
            request.FILES,
            instance=basemap
        )
        if form.is_valid():
            instance = form.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-basemap-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)


class BasemapEditBatchView(
    RoleContributorRequiredMixin, BasemapCreateView
):
    """Basemap Edit Batch View."""

    template_name = 'frontend/admin/basemap/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Batch Basemap'

    @property
    def content_title(self):
        """Return content title that used on page title basemap."""
        list_url = reverse('admin-basemap-list-view')
        return (
            f'<a href="{list_url}">Basemaps</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['batch'] = True
        return context

    def post(self, request, **kwargs):
        """Edit basemap."""
        data = request.POST.copy()
        ids = data.get('ids', None)
        if not ids:
            return HttpResponseBadRequest('ids needs in payload')
        ids = ids.split(',')
        for basemap in BasemapLayer.permissions.edit(request.user).filter(
                id__in=ids
        ):
            # Save style if it has style on payload
            initial_data = model_to_dict(basemap)
            if basemap.group:
                initial_data['group'] = basemap.group.name
            for key, value in data.items():
                initial_data[key] = value
            form = BasemapForm(initial_data, instance=basemap)
            form.is_valid()
            instance = form.instance
            instance.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
        return redirect(reverse('admin-basemap-list-view'))
