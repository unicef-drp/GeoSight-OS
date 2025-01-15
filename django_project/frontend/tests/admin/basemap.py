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
from django.shortcuts import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.basemap_layer import BasemapLayer, BasemapLayerType


User = get_user_model()


class BasemapAdminViewTest(BaseViewTest.TestCaseWithBatch):
    """Test for Basemap Admin."""

    list_url_tag = 'admin-basemap-list-view'
    create_url_tag = 'admin-basemap-create-view'
    edit_url_tag = 'admin-basemap-edit-view'
    batch_edit_url_tag = 'admin-basemap-edit-batch-view'
    payload = {
        'name': 'name',
        'url': 'url',
        'type': BasemapLayerType.XYZ_TILE,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return BasemapLayer.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return BasemapLayer.permissions.list(user).order_by('id')
