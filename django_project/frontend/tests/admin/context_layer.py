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

import copy

from django.contrib.auth import get_user_model

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.context_layer import ContextLayer, LayerType

User = get_user_model()


class ContextLayerAdminViewTest(BaseViewTest.TestCaseWithBatch):
    """Test for ContextLayer Admin."""

    list_url_tag = 'admin-context-layer-list-view'
    create_url_tag = 'admin-context-layer-create-view'
    edit_url_tag = 'admin-context-layer-edit-view'
    batch_edit_url_tag = 'admin-context-layer-edit-batch-view'
    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.ARCGIS,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return ContextLayer.permissions.list(user).order_by('id')
