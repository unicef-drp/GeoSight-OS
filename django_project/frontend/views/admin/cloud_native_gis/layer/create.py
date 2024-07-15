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
__date__ = '12/07/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.cloud_native_gis.forms.layer import CloudNativeGISLayerForm
from geosight.cloud_native_gis.models import CloudNativeGISLayer
from geosight.permission.access import RoleCreatorRequiredMixin


class CloudNativeGISLayerCreateView(RoleCreatorRequiredMixin, AdminBaseView):
    """CloudNativeGISLayer Create View."""

    template_name = 'frontend/admin/cloud_native_gis/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Cloud Native GIS Layer'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-cloud-native-gis-layer-list-view')
        create_url = reverse('admin-cloud-native-gis-layer-create-view')
        return (
            f'<a href="{list_url}">Cloud Native GIS Layer</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        initial = None

        # from_id used for duplication
        from_id = self.request.GET.get('from')
        if from_id:
            try:
                model = CloudNativeGISLayer.objects.get(id=from_id)
                initial = CloudNativeGISLayerForm.model_to_initial(model)
                initial['name'] = None
                initial['description'] = None
            except CloudNativeGISLayer.DoesNotExist:
                pass
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': CloudNativeGISLayerForm(initial=initial),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = CloudNativeGISLayerForm(request.POST)
        if form.is_valid():
            instance = form.instance
            instance.created_by = request.user
            instance.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-cloud-native-gis-layer-edit-view',
                    kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
