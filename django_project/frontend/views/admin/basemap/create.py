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

from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.basemap import BasemapForm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.permission.access import RoleCreatorRequiredMixin


class BaseBasemapEditView(AdminBaseView):
    """Base Basemap Edit View."""

    template_name = 'frontend/admin/basemap/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Basemap'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-basemap-list-view')
        create_url = reverse('admin-basemap-create-view')
        return (
            f'<a href="{list_url}">Basemaps</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        rules = []
        initial = None

        # from_id used for duplication
        from_id = self.request.GET.get('from')
        if from_id:
            try:
                model = BasemapLayer.objects.get(id=from_id)
                initial = BasemapForm.model_to_initial(model)
                initial['name'] = None
                initial['description'] = None
                rules = model.rules_dict()
            except BasemapLayer.DoesNotExist:
                pass
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': BasemapForm(initial=initial),
                'rules': rules,
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = BasemapForm(request.POST)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
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
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )


class BasemapCreateView(RoleCreatorRequiredMixin, BaseBasemapEditView):
    """Basemap Create View."""

    pass
