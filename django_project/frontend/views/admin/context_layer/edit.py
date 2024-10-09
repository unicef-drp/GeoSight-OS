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
from frontend.views.admin.context_layer.create import ContextLayerCreateView
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer
from geosight.permission.access import (
    edit_permission_resource,
    RoleContributorRequiredMixin
)


class ContextLayerEditView(RoleContributorRequiredMixin, AdminBaseView):
    """ContextLayer Edit View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Context Layer'

    @property
    def content_title(self):
        """Return content title that used on page title context_layer."""
        context_layer = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-context-layer-list-view')
        edit_url = reverse(
            'admin-context-layer-edit-view', args=[context_layer.id]
        )
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{context_layer.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)
        permission = instance.permission.all_permission(self.request.user)

        context.update(
            {
                'id': instance.id,
                'form': ContextLayerForm(
                    initial=ContextLayerForm.model_to_initial(instance)
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit context_layer."""
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)
        data = request.POST.copy()
        data['data_fields'] = request.POST.get('data_fields', '[]')
        form = ContextLayerForm(
            data,
            instance=instance
        )

        if form.is_valid():
            context_layer = form.save()
            context_layer.save_relations(data)
            return redirect(
                reverse(
                    'admin-context-layer-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)


class ContextLayerEditBatchView(
    AdminBatchEditView, ContextLayerCreateView
):
    """ContextLayer Edit Batch View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Batch Context Layer'

    @property
    def content_title(self):
        """Return content title that used on page title context_layer."""
        list_url = reverse('admin-context-layer-list-view')
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    @property
    def edit_query(self):
        """Return query for edit."""
        return ContextLayer.permissions.edit(self.request.user)

    @property
    def form(self):
        """Return form."""
        return ContextLayerForm

    @property
    def redirect_url(self):
        """Return redirect url."""
        return reverse('admin-context-layer-list-view')
