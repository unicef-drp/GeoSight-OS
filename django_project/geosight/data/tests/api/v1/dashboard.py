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
__date__ = '08/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import copy
import json
import urllib.parse
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.dashboard import Dashboard, DashboardGroup
from geosight.data.services.dashboard_create import INTERNAL_CREATE_ERROR
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardPermissionTest(BasePermissionTest.TestCase):
    """Test for Dashboard API."""

    create_payload_data = {
        'reference_layer': 'AAAA',
        'indicator_layers': [],
        'indicator_layers_structure': {'children': []},
        'indicators': [],
        'basemaps_layers': [],
        'basemaps_layers_structure': {'children': []},
        'context_layers': [],
        'context_layers_structure': {'children': []},
        'extent': [0, 0, 0, 0],
        'widgets': [],
        'widgets_structure': {},
        'filters': {},
        'permission': {
            'organization_permission': 'None',
            'public_permission': 'None',
            'user_permissions': [],
            'group_permissions': [],
        }
    }

    def setUp(self):
        """To setup test."""
        super().setUp()
        ReferenceLayerView.objects.get_or_create(
            identifier='AAAA',
            name='AAAA'
        )

        # Resource layer attribute
        self.resource_1 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=DashboardGroup.objects.create(name='Group 1')
        )
        self.resource_2 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=DashboardGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        self.resource_3 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=DashboardGroup.objects.create(name='Group 3'),
            description='Resource 3'
        )
        self.resource_3.featured = True
        self.resource_3.save()

        # Create by creator with featured
        # But it can't change the featured, as just admin can change it
        with self.assertRaises(PermissionError):
            Dashboard.permissions.create(
                user=self.resource_creator,
                name='Name C',
                group=DashboardGroup.objects.create(name='Group 3'),
                description='Resource 3',
                featured=True
            )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def create_resource(self, user):
        """Create resource function."""
        return None

    def get_resources(self, user):
        """Create resource function."""
        return None

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('dashboards-list')
        resource = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name Public',
            group=DashboardGroup.objects.create(name='Group 4')
        )
        resource.permission.public_permission = PERMISSIONS.READ.name
        resource.permission.save()
        response = self.assertRequestGetView(url, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertFalse("modified_by" in response.json()['results'][0].keys())
        self.assertFalse("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 4)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 2)
        self.assertTrue("modified_by" in response.json()['results'][0].keys())
        self.assertTrue("created_by" in response.json()['results'][0].keys())

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'name__contains': 'ame C'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.slug
        )

        params = urllib.parse.urlencode(
            {
                'description__contains': 'test'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.slug
        )

        params = urllib.parse.urlencode(
            {
                'category__name__in': 'Group 1,Group 2'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.slug, self.resource_2.slug])

        # Not contains
        params = urllib.parse.urlencode(
            {
                'category__name__in': '!Group 1,Group 2'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.slug])

        # ---------------------------------
        # SEARCH
        # ---------------------------------
        params = urllib.parse.urlencode(
            {
                'q': 'Resource '
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Name C')

        # -----------------------------------
        # Featured
        # -----------------------------------
        params = urllib.parse.urlencode(
            {
                'featured': False
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.slug, self.resource_2.slug])

        params = urllib.parse.urlencode(
            {
                'featured': True
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.slug])

        # For viewer
        # We create 2 public dashboard
        resource_1 = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name Public 1',
            group=DashboardGroup.objects.create(name='Group 4')
        )
        resource_1.permission.public_permission = PERMISSIONS.READ.name
        resource_1.permission.save()
        resource_2 = Dashboard.permissions.create(
            user=self.admin,
            name='Name Public Featured',
            group=DashboardGroup.objects.create(name='Group 4'),
            featured=True
        )
        resource_2.permission.public_permission = PERMISSIONS.READ.name
        resource_2.permission.save()

        params = urllib.parse.urlencode(
            {
                'featured': True
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [resource_2.slug])

        params = urllib.parse.urlencode(
            {
                'featured': False
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [resource_1.slug])

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'name'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_1.slug, self.resource_2.slug,
                self.resource_3.slug
            ]
        )
        params = urllib.parse.urlencode(
            {
                'sort': '-name'
            }
        )
        url = reverse('dashboards-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.slug, self.resource_2.slug,
                self.resource_1.slug
            ]
        )

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('dashboards-detail', args=['name-a'])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.admin)

        url = reverse(
            'dashboards-detail', kwargs={'slug': self.resource_3.slug}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )
        self.assertEqual(response.json()['featured'], True)

    def test_delete_api(self):
        """Test DELETE API."""
        slug = self.resource_1.slug
        self.check_delete_resource_with_different_users(
            slug, 'dashboards-detail')
        self.assertIsNone(Dashboard.objects.filter(slug=slug).first())

        slug = self.resource_3.slug
        self.check_delete_resource_with_different_users(
            slug, 'dashboards-detail'
        )
        self.assertIsNone(Dashboard.objects.filter(slug=slug).first())

    def test_list_group(self):
        """Test list dashboarg group for user API."""
        url = reverse('dashboards-groups')
        self.assertRequestGetView(url, 200)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()), 3)
        groups = list(
            Dashboard.objects.values_list(
                'group__name', flat=True
            ).distinct()
        )
        self.assertEqual(groups, groups)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(response.json(), ['Group 3'])

    def test_create_api_invalid_payload_returns_validation_error(self):
        """Test create API validation message for invalid payload."""
        url = reverse('dashboards-list')
        payload = {
            'name': 'invalid-payload-dashboard',
            'slug': 'invalid-payload-dashboard',
            'data': json.dumps({})
        }
        response = self.assertRequestPostView(
            url, 400, payload, user=self.creator
        )
        self.assertIn('detail', response.json())
        self.assertIn('extent', response.json()['detail'])

    def test_create_api_denies_anonymous_user(self):
        """Ensure anonymous users cannot create dashboards."""
        url = reverse('dashboards-list')
        payload_data = copy.deepcopy(self.create_payload_data)
        payload_data['slug'] = 'anonymous-denied-dashboard'
        payload = {
            'name': 'anonymous denied dashboard',
            'slug': 'anonymous-denied-dashboard',
            'data': json.dumps(payload_data)
        }

        response = self.assertRequestPostView(url, 403, payload)
        self.assertIn('detail', response.json())

    def test_create_api_denies_contributor_user(self):
        """Ensure contributor users cannot create dashboards."""
        url = reverse('dashboards-list')
        payload_data = copy.deepcopy(self.create_payload_data)
        payload_data['slug'] = 'contributor-denied-dashboard'
        payload = {
            'name': 'contributor denied dashboard',
            'slug': 'contributor-denied-dashboard',
            'data': json.dumps(payload_data)
        }

        response = self.assertRequestPostView(
            url, 403, payload, user=self.contributor
        )
        self.assertIn('detail', response.json())

    def test_create_api_returns_response_contract_fields(self):
        """Ensure create API returns expected v1 serializer contract."""
        url = reverse('dashboards-list')
        slug = 'contract-dashboard'
        payload_data = copy.deepcopy(self.create_payload_data)
        payload_data['slug'] = slug
        payload = {
            'name': 'contract dashboard',
            'slug': slug,
            'group': 'Contract Group',
            'data': json.dumps(payload_data)
        }

        response = self.assertRequestPostView(
            url, 201, payload, user=self.creator
        )
        body = response.json()

        expected_fields = {
            'id', 'slug', 'icon', 'thumbnail', 'name',
            'description', 'group', 'category', 'permission',
            'reference_layer', 'creator', 'featured',
            'created_at', 'created_by', 'modified_at', 'modified_by'
        }
        self.assertTrue(expected_fields.issubset(set(body.keys())))
        self.assertEqual(body['id'], slug)
        self.assertEqual(body['slug'], slug)
        self.assertEqual(body['name'], 'contract dashboard')
        self.assertEqual(body['group'], 'Contract Group')
        self.assertEqual(body['category'], 'Contract Group')
        self.assertEqual(
            body['reference_layer'],
            ReferenceLayerView.objects.get(identifier='AAAA').id
        )
        self.assertEqual(body['creator'], self.creator.id)
        self.assertEqual(body['featured'], False)
        self.assertEqual(body['created_by'], self.creator.username)
        self.assertEqual(body['modified_by'], self.creator.username)

        for permission_key in ['list', 'read', 'edit', 'share', 'delete']:
            self.assertIn(permission_key, body['permission'])

        Dashboard.objects.get(slug=slug).delete()

    def test_create_api_accepts_application_json_payload(self):
        """Ensure create API accepts application/json payloads."""
        url = reverse('dashboards-list')
        slug = 'json-contract-dashboard'
        payload_data = copy.deepcopy(self.create_payload_data)
        payload_data['slug'] = slug
        payload = {
            'name': 'json contract dashboard',
            'slug': slug,
            'group': 'JSON Contract Group',
            'data': payload_data
        }

        response = self.assertRequestPostView(
            url, 201, json.dumps(payload), user=self.creator,
            content_type=self.JSON_CONTENT
        )
        body = response.json()

        self.assertEqual(body['id'], slug)
        self.assertEqual(body['slug'], slug)
        self.assertEqual(body['name'], 'json contract dashboard')
        self.assertEqual(body['group'], 'JSON Contract Group')
        self.assertEqual(
            body['reference_layer'],
            ReferenceLayerView.objects.get(identifier='AAAA').id
        )

        Dashboard.objects.get(slug=slug).delete()

    def test_create_api_rolls_back_if_save_relations_fails(self):
        """Ensure dashboard create is transactional across relations."""
        url = reverse('dashboards-list')
        slug = 'rollback-dashboard'
        payload_data = copy.deepcopy(self.create_payload_data)
        payload_data['slug'] = slug
        payload = {
            'name': 'rollback-dashboard',
            'slug': slug,
            'data': json.dumps(payload_data)
        }

        with patch.object(
            Dashboard,
            'save_relations',
            side_effect=RuntimeError('save relations failure')
        ):
            response = self.assertRequestPostView(
                url, 400, payload, user=self.creator
            )

        self.assertIn('detail', response.json())
        self.assertEqual(response.json()['detail'], INTERNAL_CREATE_ERROR)
        self.assertFalse(Dashboard.objects.filter(slug=slug).exists())

    def test_feature(self):
        """Test Feature API."""
        dashboard = Dashboard.permissions.create(
            user=self.resource_creator,
            name='Name feature test',
            group=DashboardGroup.objects.create(name='Group 4')
        )

        # Verify dashboard starts as not featured
        self.assertFalse(dashboard.featured)

        # Test as_feature endpoint
        url = reverse('dashboards-as-feature', kwargs={'slug': dashboard.slug})

        # Non-logged in user should get 403
        self.assertRequestPostView(url, 403, {})

        # Non-admin users should get 403
        self.assertRequestPostView(url, 403, {}, user=self.viewer)
        self.assertRequestPostView(url, 403, {}, user=self.creator)
        self.assertRequestPostView(url, 403, {}, user=self.resource_creator)

        # Admin should be able to feature the dashboard
        self.assertRequestPostView(url, 204, {}, user=self.admin)

        # Verify dashboard is now featured
        dashboard.refresh_from_db()
        self.assertTrue(dashboard.featured)

        # Test remove_as_feature endpoint
        url = reverse(
            'dashboards-remove-as-feature', kwargs={'slug': dashboard.slug}
        )

        # Non-logged in user should get 403
        self.assertRequestPostView(url, 403, {})

        # Non-admin users should get 403
        self.assertRequestPostView(url, 403, {}, user=self.viewer)
        self.assertRequestPostView(url, 403, {}, user=self.creator)
        self.assertRequestPostView(url, 403, {}, user=self.resource_creator)

        # Admin should be able to remove feature from dashboard
        self.assertRequestPostView(url, 204, {}, user=self.admin)

        # Verify dashboard is no longer featured
        dashboard.refresh_from_db()
        self.assertFalse(dashboard.featured)
