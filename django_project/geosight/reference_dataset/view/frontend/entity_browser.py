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

from django.shortcuts import get_object_or_404, reverse

from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleLocalDatasetManagerRequiredMixin
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)


class ReferenceLayerViewEntityListView(
    RoleLocalDatasetManagerRequiredMixin, AdminBaseView
):
    """ReferenceLayerView View."""

    template_name = 'reference_dataset/admin/entity_browser.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Reference Datasets - Entity Browser'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-reference-dataset-list-view')
        view = get_object_or_404(
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        edit_url = reverse(
            'admin-reference-dataset-edit-view',
            args=[view.identifier]
        )
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span>'
            f'<a href="{edit_url}">{view.__str__()}</a> '
            '<span>></span>'
            f'<a>Entities</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        view = get_object_or_404(
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        context.update({'view_identifier': view.identifier})
        return context
