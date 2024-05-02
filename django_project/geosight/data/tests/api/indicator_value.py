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
import json
from datetime import datetime

from django.contrib.auth import get_user_model
from core.tests.base_tests import TenantTestCase as TestCase
from django.urls import reverse

from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.georepo.tests.model_factories import ReferenceLayerF
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class IndicatorValueTest(BasePermissionTest, TestCase):
    """Test for context list api."""

    payload = {
        'name': 'name',
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        group = IndicatorGroup.objects.create(name=payload['group'])
        del payload['group']
        return Indicator.permissions.create(
            user=user,
            group=group,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return Indicator.permissions.list(user).order_by('id')

    def test_push_api_permission(self):
        """Test list API."""
        url = reverse('indicator-values-list-api', args=[self.resource.id])
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()

        # Check the list returned
        data = json.dumps([])
        self.assertRequestPostView(
            url, 403, data, content_type='application/json'
        )  # Non login
        self.assertRequestPostView(
            url, 403, data, self.viewer, content_type='application/json'
        )  # Viewer
        self.assertRequestPostView(
            url, 403, data, self.contributor, content_type='application/json'
        )
        self.assertRequestPostView(
            url, 403, data, self.creator, content_type='application/json'
        )  # Creator
        self.assertRequestPostView(
            url, 403, data, self.viewer_in_group,
            content_type='application/json'
        )
        self.assertRequestPostView(
            url, 403, data, self.creator_in_group,
            content_type='application/json'
        )
        self.assertRequestPostView(
            url, 200, data, self.resource_creator,
            content_type='application/json'
        )  # Creator
        self.assertRequestPostView(
            url, 200, data, self.admin, content_type='application/json'
        )  # Admin

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestPostView(
            url, 403, data, self.contributor, content_type='application/json'
        )

        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.WRITE.name)
        self.assertRequestPostView(
            url, 200, data, self.contributor, content_type='application/json'
        )

        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestPostView(
            url, 403, data, self.viewer_in_group,
            content_type='application/json'
        )
        self.assertRequestPostView(
            url, 200, data, self.creator_in_group,
            content_type='application/json'
        )

    def test_push_api(self):
        """Test list API."""
        reference_layer = ReferenceLayerF()
        url = reverse('indicator-values-list-api', args=[self.resource.id])
        self.assertRequestPostView(
            url, 400, json.dumps({}), self.resource_creator,
            content_type='application/json'
        )
        self.assertRequestPostView(
            url, 400, json.dumps([{}]), self.resource_creator,
            content_type='application/json'
        )
        response = self.assertRequestPostView(
            url, 400, json.dumps([{
                'timestamp': '1234'
            }]), self.resource_creator,
            content_type='application/json'
        )
        self.assertEqual(response.content, b'Timestamp is not integer')

        response = self.assertRequestPostView(
            url, 400, json.dumps([{
                'timestamp': 1600000000,
                'extra_data': 'test'
            }]), self.resource_creator,
            content_type='application/json'
        )
        self.assertEqual(response.content, b'The extra_data needs to be json')

        data = [{
            'timestamp': 1599955200,
            'geom_id': 'AAA',
            'geom_id_type': 'ucode',
            'reference_layer': reference_layer.identifier,
            'admin_level': 1,
            'value': 12

        }]
        response = self.assertRequestPostView(
            url, 200, json.dumps(data), self.resource_creator,
            content_type='application/json'
        )
        data_time = datetime.fromtimestamp(data[0]['timestamp'])
        self.assertEqual(
            response.json()[0]['date'], data_time.strftime('%Y-%m-%d')
        )
        self.assertEqual(response.json()[0]['geom_id'], data[0]['geom_id'])
        self.assertEqual(
            response.json()[0]['geometries'][0]['dataset_uuid'],
            data[0]['reference_layer']
        )
        self.assertEqual(
            response.json()[0]['geometries'][0]['admin_level'],
            data[0]['admin_level']
        )
        self.assertEqual(response.json()[0]['value'], data[0]['value'])
