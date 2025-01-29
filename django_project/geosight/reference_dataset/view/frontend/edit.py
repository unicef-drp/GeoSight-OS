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

from geosight.permission.access import (
    edit_permission_resource,
    RoleLocalDatasetManagerRequiredMixin
)
from geosight.reference_dataset.forms import ReferenceDatasetForm
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)
from geosight.reference_dataset.serializer.reference_dataset import (
    ReferenceDatasetLevelSerializer
)
from .create import _BaseReferenceLayerViewView


class ReferenceLayerViewEditView(
    RoleLocalDatasetManagerRequiredMixin, _BaseReferenceLayerViewView
):
    """Reference dataset Edit View."""

    template_name = 'reference_dataset/admin/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title reference datasets."""
        obj = get_object_or_404(
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        list_url = reverse('admin-reference-dataset-list-view')
        edit_url = reverse(
            'admin-reference-dataset-edit-view', args=[obj.identifier]
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
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        edit_permission_resource(obj, self.request.user)
        permission = obj.permission.all_permission(self.request.user)

        context.update(
            {
                'id': obj.identifier,
                'form': ReferenceDatasetForm(
                    initial=ReferenceDatasetForm.model_to_initial(obj)
                ),
                'levels': json.dumps(
                    ReferenceDatasetLevelSerializer(
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
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        edit_permission_resource(obj, self.request.user)
        return ReferenceDatasetForm(self.request.POST, instance=obj)
