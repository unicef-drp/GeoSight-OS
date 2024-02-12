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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.reference_layer_view_uploader import (
    ReferenceLayerViewCreateForm, ReferenceLayerViewUploaderLevelForm
)
from geosight.permission.access import RoleCreatorRequiredMixin


class ReferenceLayerViewUploaderView(RoleCreatorRequiredMixin, AdminBaseView):
    """Reference Layer Uploader View."""

    template_name = 'frontend/admin/reference_layer_view/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Reference Layer View'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return (
            f'<a">Reference Layer View</a> '
            f'<span>></span>'
            f'<a>Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        rules = []
        initial = None
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': ReferenceLayerViewCreateForm(initial=initial),
                'rules': rules,
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = ReferenceLayerViewCreateForm(request.POST)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            try:
                for key, value in request.FILES.items():
                    if '_level_file' in key:
                        idx = key.replace('_level_file', '')
                        data = {
                            'uploader': instance.id,
                            'level': idx,
                            'name': request.POST.get(f'{idx}_level_name', ''),
                            'name_column': request.POST.get(
                                f'{idx}_column_name', ''
                            ),
                            'ucode_column': request.POST.get(
                                f'{idx}_column_ucode', ''
                            ),
                            'parent_ucode_column': request.POST.get(
                                f'{idx}_column_parent_ucode', ''
                            ),
                        }
                        form = ReferenceLayerViewUploaderLevelForm(data, {
                            'file': value
                        })
                        if form.is_valid():
                            form.save()
                        else:
                            raise Exception('There is error on level config.')
                return redirect(
                    reverse(
                        'admin-boundary-create-view'
                    ) + '?success=true'
                )
            except Exception as e:
                pass
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
