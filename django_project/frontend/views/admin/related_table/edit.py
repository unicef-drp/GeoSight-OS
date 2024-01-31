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
__date__ = '31/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.forms.models import model_to_dict
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from frontend.views.admin.related_table.create import RelatedTableCreateView
from geosight.data.forms.related_table import RelatedTableForm
from geosight.data.models.related_table import RelatedTable
from geosight.permission.access import (
    edit_permission_resource,
    RoleContributorRequiredMixin
)


class RelatedTableEditView(RoleContributorRequiredMixin, AdminBaseView):
    """RelatedTable Edit View."""

    template_name = 'frontend/admin/related_table/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Related Table'

    @property
    def content_title(self):
        """Return content title that used on page title related table."""
        obj = get_object_or_404(
            RelatedTable, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-related-table-list-view')
        edit_url = reverse('admin-related-table-edit-view', args=[obj.id])
        return (
            f'<a href="{list_url}">Related Tables</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{obj.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        obj = get_object_or_404(
            RelatedTable, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(obj, self.request.user)
        permission = obj.permission.all_permission(self.request.user)

        context.update(
            {
                'id': obj.id,
                'form': RelatedTableForm(
                    initial=RelatedTableForm.model_to_initial(obj)
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit related table."""
        obj = get_object_or_404(
            RelatedTable, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(obj, self.request.user)
        form = RelatedTableForm(
            request.POST,
            request.FILES,
            instance=obj
        )
        if form.is_valid():
            instance = form.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-related-table-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)


class RelatedTableEditBatchView(
    RoleContributorRequiredMixin, RelatedTableCreateView
):
    """RelatedTable Edit Batch View."""

    template_name = 'frontend/admin/related_table/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Batch Related Table'

    @property
    def content_title(self):
        """Return content title that used on page title related-table."""
        list_url = reverse('admin-related-table-list-view')
        return (
            f'<a href="{list_url}">Related tables</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['batch'] = True
        return context

    def post(self, request, **kwargs):
        """Edit related-table."""
        data = request.POST.copy()
        ids = data.get('ids', None)
        if not ids:
            return HttpResponseBadRequest('ids needs in payload')
        ids = ids.split(',')
        for related_table in RelatedTable.permissions.edit(
                request.user
        ).filter(id__in=ids):
            # Save style if it has style on payload
            initial_data = model_to_dict(related_table)
            for key, value in data.items():
                initial_data[key] = value
            form = RelatedTableForm(initial_data, instance=related_table)
            form.is_valid()
            instance = form.instance
            instance.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
        return redirect(reverse('admin-related-table-list-view'))
