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
from geosight.data.forms.reference_layer_view_importer import (
    ReferenceLayerViewCreateForm, ReferenceLayerViewImporterLevelForm
)
from geosight.permission.access import RoleCreatorRequiredMixin


class ReferenceLayerViewImporterView(RoleCreatorRequiredMixin, AdminBaseView):
    """Reference Layer importer View."""

    template_name = 'frontend/admin/reference_layer_view/upload_form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-reference-layer-view-list-view')
        create_url = reverse('admin-reference-layer-view-create-view')
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span>'
            f'<a href="{create_url}">Create</a> '
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
                            'importer': instance.id,
                            'level': idx,
                            'name': request.POST.get(f'{idx}_level_name', ''),
                            'name_field': request.POST.get(
                                f'{idx}_field_name', ''
                            ),
                            'ucode_field': request.POST.get(
                                f'{idx}_field_ucode', ''
                            ),
                            'parent_ucode_field': request.POST.get(
                                f'{idx}_field_parent_ucode', ''
                            ),
                        }
                        form = ReferenceLayerViewImporterLevelForm(data, {
                            'file': value
                        })
                        if form.is_valid():
                            form.save()
                        else:
                            raise Exception('There is error on level config.')
                        instance.run()
                return redirect(
                    reverse(
                        'admin-reference-layer-view-list-view'
                    ) + '?success=true'
                )
            except Exception:
                pass
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
