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

from django.shortcuts import get_object_or_404, reverse
from django.utils import timezone

from frontend.views.admin._base import AdminBaseView
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView
)
from geosight.georepo.models.reference_layer_importer import (
    ReferenceLayerViewImporter
)
from geosight.georepo.serializer.reference_layer_importer import (
    ReferenceLayerViewImporterLevelSerializer
)
from geosight.permission.access import (
    edit_data_permission_resource,
    RoleLocalDatasetManagerRequiredMixin
)


class ReferenceLayerViewImportDataView(
    RoleLocalDatasetManagerRequiredMixin,
    AdminBaseView
):
    """ReferenceLayerView View."""

    template_name = 'frontend/admin/reference_layer_view/importer_form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Import Data Reference Datasets'

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
        import_url = reverse(
            'admin-reference-layer-view-import-data-view',
            args=[obj.identifier]
        )
        title = (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span>'
            f'<a href="{edit_url}">{obj.__str__()}</a> '
            '<span>></span> '
            f'<a href="{import_url}">Import data</a> '
        )
        _id = self.kwargs.get('pk', 0)
        if _id:
            importer = get_object_or_404(
                ReferenceLayerViewImporter, id=_id
            )
            edit_import_url = reverse(
                'admin-reference-layer-view-import-data-edit-view',
                args=[obj.identifier, importer.pk]
            )
            title += (
                '<span>></span> '
                f'<a href="{edit_import_url}">{importer.__str__()}</a> '
            )
        return title

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        obj = get_object_or_404(
            ReferenceLayerView, identifier=self.kwargs.get('identifier', '')
        )
        created_at = timezone.now().isoformat()
        levels = []
        initial_levels = []

        _id = self.kwargs.get('pk', 0)
        if _id:
            importer = get_object_or_404(
                ReferenceLayerViewImporter, id=_id
            )
            created_at = importer.created_at
            level_set = importer.referencelayerviewimporterlevel_set.order_by(
                'level'
            )
            levels = ReferenceLayerViewImporterLevelSerializer(
                level_set, many=True
            ).data
        edit_data_permission_resource(obj, self.request.user)
        context.update(
            {
                'identifier': obj.identifier,
                'created_at': created_at,
                'levels': json.loads(json.dumps(levels))
            }
        )
        return context
