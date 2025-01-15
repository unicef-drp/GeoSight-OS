# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '15/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import copy

from django.contrib.auth import get_user_model

from geosight.data.tests.django_admin._base import BaseDjangoAdminTest
from geosight.data.models.basemap_layer import BasemapLayer, BasemapLayerType


User = get_user_model()


class BasemapAdminViewTest(BaseDjangoAdminTest.TestCase):
    """Test for Basemap Django Admin."""

    list_url_tag = 'admin:geosight_data_basemaplayer_changelist'
    create_url_tag = 'admin:geosight_data_basemaplayer_add'
    edit_url_tag = 'admin:geosight_data_basemaplayer_change'
    payload = {
        'name': 'name',
        'url': 'url',
        'type': BasemapLayerType.XYZ_TILE,
        'group': ''
    }
    form_payload = {}

    def setUp(self):
        super().setUp()
        self.form_payload = copy.deepcopy(self.payload)
        self.form_payload.update({
            'basemaplayerparameter_set-TOTAL_FORMS': 0,
            'basemaplayerparameter_set-INITIAL_FORMS': 0,
        })

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
