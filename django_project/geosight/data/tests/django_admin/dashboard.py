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
import json
import uuid
from django.contrib.auth import get_user_model

from geosight.data.models.dashboard import Dashboard
from geosight.data.tests.django_admin._base import BaseDjangoAdminTest
from geosight.georepo.models.reference_layer import ReferenceLayerView

User = get_user_model()


class DashboardAdminViewTest(BaseDjangoAdminTest.TestCase):
    """Test for Dashboard Admin."""

    list_url_tag = 'admin:geosight_data_dashboard_changelist'
    create_url_tag = 'admin:geosight_data_dashboard_add'
    edit_url_tag = 'admin:geosight_data_dashboard_change'

    # payload
    payload = {
        "reference_layer": "",
        "indicator_layers": [],
        "indicator_layers_structure": '',
        "indicators": [],
        "basemaps_layers": [],
        "basemaps_layers_structure": '',
        "context_layers": [],
        "context_layers_structure": '',
        "extent": json.dumps({
            "type": "Polygon",
            "coordinates": [
              [
                [0.0, 0.0],
                [0.0, 1.0],
                [1.0, 1.0],
                [1.0, 0.0],
                [0.0, 0.0]
              ]
            ]
          }),
        "widgets": [],
        "widgets_structure": '',
        "filters": '',
        "permission": {
            "organization_permission": "None",
            "public_permission": "None",
            "user_permissions": [],
            "group_permissions": [],
        },
        'level_config': '',
        'default_time_mode': '',
        'version_data': '2025-01-01 01:01:01',
        'slug': uuid.uuid4().hex,
        'geo_field': 'test',

    }
    form_payload = {}

    def setUp(self):
        """To setup test."""
        self.form_payload = copy.deepcopy(self.payload)
        self.form_payload.update({
            'version_data_0': '2025-01-01',
            'version_data_1': '01:01:01',
            'dashboardbasemap_set-TOTAL_FORMS': 0,
            'dashboardbasemap_set-INITIAL_FORMS': 0,
            'dashboardcontextlayer_set-TOTAL_FORMS': 0,
            'dashboardcontextlayer_set-INITIAL_FORMS': 0,
            'dashboardwidget_set-TOTAL_FORMS': 0,
            'dashboardwidget_set-INITIAL_FORMS': 0,
            'dashboardtool_set-TOTAL_FORMS': 0,
            'dashboardtool_set-INITIAL_FORMS': 0,
        })

        ReferenceLayerView.objects.get_or_create(
            identifier="AAAA",
            name="AAAA"
        )
        super().setUp()

    def create_resource(self, user):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name='name'
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')
