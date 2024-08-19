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

from django.shortcuts import get_object_or_404, reverse

from geosight.data.forms.reference_layer_view import ReferenceLayerViewForm
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView
)
from geosight.georepo.serializer.reference_layer import (
    ReferenceLayerViewLevelSerializer
)
from geosight.permission.access import (
    edit_permission_resource,
    RoleLocalDatasetManagerRequiredMixin
)
from .create import _BaseReferenceLayerViewView


class ReferenceLayerViewEditView(
    RoleLocalDatasetManagerRequiredMixin, _BaseReferenceLayerViewView
):
    """Reference dataset Edit View."""

    template_name = 'frontend/admin/reference_layer_view/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title reference datasets."""
        obj = get_object_or_404(
            ReferenceLayerView, identifier=self.kwargs.get('identifier', '')
        )
        list_url = reverse('admin-reference-layer-view-list-view')
        edit_url = reverse(
            'admin-reference-layer-view-edit-view', args=[obj.identifier]
        )
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span> '
            f'<a href="{edit_url}">{obj.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        obj = get_object_or_404(
            ReferenceLayerView, identifier=self.kwargs.get('identifier', '')
        )
        edit_permission_resource(obj, self.request.user)
        permission = obj.permission.all_permission(self.request.user)

        context.update(
            {
                'id': obj.identifier,
                'form': ReferenceLayerViewForm(
                    initial=ReferenceLayerViewForm.model_to_initial(obj)
                ),
                'levels': json.dumps(
                    ReferenceLayerViewLevelSerializer(
                        obj.levels, many=True
                    ).data
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def get_form(self):
        """Get form."""
        obj = get_object_or_404(
            ReferenceLayerView, identifier=self.kwargs.get('identifier', '')
        )
        edit_permission_resource(obj, self.request.user)
        return ReferenceLayerViewForm(self.request.POST, instance=obj)
