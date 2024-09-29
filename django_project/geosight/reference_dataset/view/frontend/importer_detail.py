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
__date__ = '26/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.shortcuts import redirect, get_object_or_404, reverse

from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import (
    RoleLocalDatasetManagerRequiredMixin
)
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter
)


class ReferenceLayerViewImporterDetailView(
    RoleLocalDatasetManagerRequiredMixin,
    AdminBaseView
):
    """ReferenceLayerView View."""

    template_name = 'reference_dataset/admin/importer_detail.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Import Data Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title reference datasets."""
        list_url = reverse('admin-reference-dataset-list-view')
        obj = get_object_or_404(
            ReferenceDataset, identifier=self.kwargs.get('identifier', '')
        )
        edit_url = reverse(
            'admin-reference-dataset-edit-view', args=[obj.identifier]
        )
        self.importer = get_object_or_404(
            ReferenceDatasetImporter, pk=self.kwargs.get('pk', '')
        )
        detail_url = reverse(
            'admin-reference-dataset-import-data-detail-view',
            args=[obj.identifier, self.importer.id]
        )
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span>'
            f'<a href="{edit_url}">{obj.__str__()}</a> '
            '<span>></span>'
            '<a>Importer</a> '
            '<span>></span>'
            f'<a href="{detail_url}">{self.importer.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context['obj_id'] = self.importer.id
        context['identifier'] = self.importer.reference_layer.identifier
        return context

    def post(self, request, **kwargs):
        """POST to run the importer."""
        _id = self.kwargs.get('pk', 0)
        importer = get_object_or_404(
            ReferenceDatasetImporter, id=_id
        )
        importer.run()
        return redirect(
            reverse(
                'admin-reference-dataset-import-data-detail-view',
                kwargs={
                    'identifier': importer.reference_layer.identifier,
                    'pk': importer.id
                }
            )
        )
