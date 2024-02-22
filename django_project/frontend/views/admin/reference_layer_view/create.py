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
__date__ = '21/02/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.reference_layer_view import ReferenceLayerViewForm
from geosight.georepo.models.reference_layer import (
    ReferenceLayerViewLevel as Level
)
from geosight.permission.access import RoleCreatorRequiredMixin


class _BaseReferenceLayerViewView(AdminBaseView):
    """Basemap Create View."""

    template_name = 'frontend/admin/reference_layer_view/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title reference datasets."""
        list_url = reverse('admin-reference-layer-view-list-view')
        create_url = reverse('admin-reference-layer-view-create-view')
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': ReferenceLayerViewForm(),
                'levels': [],
                'permission': json.dumps(permission)
            }
        )
        return context

    def get_form(self):
        """Get form."""
        return ReferenceLayerViewForm(self.request.POST)

    def post(self, request, **kwargs):
        """Create reference-layer-view."""
        form = self.get_form()
        if form.is_valid():
            instance = form.save()
            if not instance.creator:
                instance.creator = request.user
                instance.save()

            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
            max_level = 0
            for key, value in request.POST.items():
                if 'level_name_' in key:
                    level_idx = int(key.replace('level_name_', ''))
                    try:
                        level, _ = Level.objects.get_or_create(
                            reference_layer=instance,
                            level=level_idx
                        )
                        if level_idx > max_level:
                            max_level = level_idx
                        if level.name != value:
                            level.name = value
                            level.save()
                    except Level.DoesNotExist:
                        pass
            instance.levels.filter(level__gt=max_level).delete()
            return redirect(
                reverse(
                    'admin-reference-layer-view-edit-view',
                    kwargs={'identifier': instance.identifier}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)


class ReferenceLayerViewCreateView(
    RoleCreatorRequiredMixin, _BaseReferenceLayerViewView
):
    """Basemap Create View."""

    pass
