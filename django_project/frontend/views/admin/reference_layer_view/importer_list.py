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

from django.shortcuts import reverse

from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import (
    RoleLocalDatasetManagerRequiredMixin
)


class ReferenceLayerViewImporterListView(
    RoleLocalDatasetManagerRequiredMixin,
    AdminBaseView
):
    """ReferenceLayerView View."""

    template_name = 'frontend/admin/reference_layer_view/importer_list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Import Data Reference Datasets'

    @property
    def content_title(self):
        """Return content title that used on page title reference datasets."""
        list_url = reverse('admin-reference-layer-view-list-view')
        return (
            f'<a href="{list_url}">Reference Datasets</a> '
            '<span>></span>'
            f'<a>Importer</a> '
        )
