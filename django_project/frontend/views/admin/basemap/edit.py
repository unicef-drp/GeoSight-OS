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

from frontend.views.admin._base import AdminBaseView, AdminBatchEditView
from frontend.views.admin.basemap.create import (
    BaseBasemapEditView
)
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
        data = request.POST.copy()
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(basemap, self.request.user)
        form = BasemapForm(
            data,
            request.FILES,
            instance=basemap
        )
        if form.is_valid():
            instance = form.save(commit=False)
            instance.modified_by = request.user
            instance.save()
            # Save permission
            instance.permission.update_from_request_data(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-basemap-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        if data.get('permission', None):
            form.permission_data = data.get('permission', None)
        context['form'] = form
        return render(request, self.template_name, context)


class BasemapEditBatchView(
    AdminBatchEditView, BaseBasemapEditView
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

    @property
    def edit_query(self):
        """Return query for edit."""
        return BasemapLayer.permissions.edit(self.request.user)

    @property
    def form(self):
        """Return form."""
        return BasemapForm

    @property
    def redirect_url(self):
        """Return redirect url."""
        return reverse('admin-basemap-list-view')
