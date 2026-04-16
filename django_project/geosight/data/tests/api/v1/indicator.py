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
__date__ = '09/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.indicator import Indicator, IndicatorGroup
from geosight.data.models.indicator.indicator_type import IndicatorType
from geosight.data.models.style.base import StyleType
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class IndicatorPermissionTest(BasePermissionTest.TestCase):
    """Test for Indicator API."""

    def create_resource(self, user):
        """Create resource function."""
        return None

    def get_resources(self, user):
        """Create resource function."""
        return None

    def setUp(self):
        """To setup test."""
        super().setUp()

        # Resource layer attribute
        self.resource_1 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=IndicatorGroup.objects.create(name='Group 1')
        )
        self.resource_2 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=IndicatorGroup.objects.create(name='Group 2'),
            description='This is test',
            shortcode='Name_B'
        )
        self.resource_3 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=IndicatorGroup.objects.create(name='Group 3'),
            description='Resource 3',
            shortcode='Resource_C',
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('indicators-list')

        resource = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name Public',
            group=IndicatorGroup.objects.create(name='Group 4')
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

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
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
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_3.id
        )

        params = urllib.parse.urlencode(
            {
                'description__contains': 'test'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

        params = urllib.parse.urlencode(
            {
                'category__name__in': 'Group 1,Group 2'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_1.id, self.resource_2.id])

        # Not contains
        params = urllib.parse.urlencode(
            {
                'category__name__in': '!Group 1,Group 2'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        for result in response.json()['results']:
            self.assertTrue(
                result['id'] in [self.resource_3.id])

        # Search
        params = urllib.parse.urlencode(
            {
                'q': 'Resource '
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Name C')

        params = urllib.parse.urlencode(
            {
                'q': 'Name_'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Name B')

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'name'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_1.id, self.resource_2.id,
                self.resource_3.id
            ]
        )
        params = urllib.parse.urlencode(
            {
                'sort': '-name'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.id, self.resource_2.id,
                self.resource_1.id
            ]
        )

    def test_detail_api(self):
        """Test GET DETAIL API."""
        url = reverse('indicators-detail', args=[self.resource_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        self.assertRequestGetView(url, 200, user=self.resource_creator)
        self.assertRequestGetView(url, 200, user=self.admin)

        url = reverse(
            'indicators-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        self.assertEqual(response.json()['name'], self.resource_3.name)
        self.assertEqual(
            response.json()['created_by'], self.resource_3.creator.username
        )

    def test_create_api(self):
        """Test POST API."""
        url = reverse('indicators-list') + '?fields=__all__'
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        # Missing shortcode must be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New Indicator',
                "category": 'New Category'
            },
            content_type=self.JSON_CONTENT
        )
        # Missing category must be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New Indicator',
                "shortcode": 'new_indicator'
            },
            content_type=self.JSON_CONTENT
        )
        # Invalid type must be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New Indicator',
                "shortcode": 'new_indicator',
                "category": 'New Category',
                "type": 'InvalidType'
            },
            content_type=self.JSON_CONTENT
        )
        # Invalid style_type must be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'New Indicator',
                "shortcode": 'new_indicator',
                "category": 'New Category',
                "style_type": 'InvalidStyleType'
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPostView(
            url, 201,
            user=self.creator,
            data={
                "name": 'New Indicator',
                "shortcode": 'new_indicator',
                "category": 'New Category',
                "type": IndicatorType.INTEGER,
                "style_type": StyleType.PREDEFINED
            },
            content_type=self.JSON_CONTENT
        )
        obj = Indicator.objects.get(id=response.json()['id'])
        self.assertEqual(obj.name, 'New Indicator')
        self.assertEqual(response.json()['name'], 'New Indicator')
        self.assertEqual(obj.shortcode, 'new_indicator')
        self.assertEqual(obj.group.name, 'New Category')
        self.assertEqual(response.json()['category'], 'New Category')
        self.assertEqual(obj.type, IndicatorType.INTEGER)
        self.assertEqual(response.json()['type'], IndicatorType.INTEGER)
        self.assertEqual(obj.style_type, StyleType.PREDEFINED)
        self.assertEqual(response.json()['style_type'], StyleType.PREDEFINED)
        self.assertEqual(obj.creator, self.creator)
        self.assertEqual(response.json()['created_by'], self.creator.username)

        # Duplicate shortcode must be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'Another Indicator',
                "shortcode": 'new_indicator',
                "category": 'New Category'
            },
            content_type=self.JSON_CONTENT
        )
        # Existing shortcode from setUp must also be rejected
        self.assertRequestPostView(
            url, 400,
            user=self.creator,
            data={
                "name": 'Yet Another Indicator',
                "shortcode": 'Name_B',
                "category": 'New Category'
            },
            content_type=self.JSON_CONTENT
        )

    def test_update_api(self):
        """Test PUT API."""
        url = reverse('indicators-detail', args=[0])
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 404, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'indicators-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        # Missing shortcode must be rejected
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "category": 'Updated Category'
            },
            content_type=self.JSON_CONTENT
        )
        # Missing category must be rejected
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "shortcode": 'updated_shortcode'
            },
            content_type=self.JSON_CONTENT
        )
        # Invalid type must be rejected
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "shortcode": 'updated_shortcode',
                "category": 'Updated Category',
                "type": 'InvalidType'
            },
            content_type=self.JSON_CONTENT
        )
        # Invalid style_type must be rejected
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "shortcode": 'updated_shortcode',
                "category": 'Updated Category',
                "style_type": 'InvalidStyleType'
            },
            content_type=self.JSON_CONTENT
        )
        # Duplicate shortcode (already used by resource_2) must be rejected
        self.assertRequestPutView(
            url, 400,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "shortcode": 'Name_B',
                "category": 'Updated Category'
            },
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPutView(
            url, 200,
            user=self.creator_in_group,
            data={
                "name": self.resource_3.name,
                "shortcode": 'updated_shortcode',
                "category": 'Updated Category',
                "type": IndicatorType.FLOAT,
                "style_type": IndicatorStyleType.LIBRARY
            },
            content_type=self.JSON_CONTENT
        )
        obj = Indicator.objects.get(id=self.resource_3.id)
        self.assertEqual(obj.name, 'Name C')
        self.assertEqual(obj.shortcode, 'updated_shortcode')
        self.assertEqual(obj.group.name, 'Updated Category')
        self.assertEqual(response.json()['category'], 'Updated Category')
        self.assertEqual(obj.type, IndicatorType.FLOAT)
        self.assertEqual(response.json()['type'], IndicatorType.FLOAT)
        self.assertEqual(obj.style_type, IndicatorStyleType.LIBRARY)
        self.assertEqual(response.json()['style_type'],
                         IndicatorStyleType.LIBRARY)
        self.assertEqual(obj.description, '')

    def test_partial_update_api(self):
        """Test PATCH API."""
        url = reverse('indicators-detail', args=[0])
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 404, user=self.creator, data={})
        self.assertRequestPatchView(url, 404, user=self.admin, data={})

        url = reverse(
            'indicators-detail', kwargs={'id': self.resource_3.id}
        )
        self.assertRequestPatchView(url, 403, data={})
        self.assertRequestPatchView(url, 403, user=self.viewer, data={})
        self.assertRequestPatchView(url, 403, user=self.creator, data={})
        # Invalid type must be rejected
        self.assertRequestPatchView(
            url, 400,
            user=self.creator_in_group,
            data={"type": 'InvalidType'},
            content_type=self.JSON_CONTENT
        )
        # Invalid style_type must be rejected
        self.assertRequestPatchView(
            url, 400,
            user=self.creator_in_group,
            data={"style_type": 'InvalidStyleType'},
            content_type=self.JSON_CONTENT
        )
        # Duplicate shortcode (already used by resource_2) must be rejected
        self.assertRequestPatchView(
            url, 400,
            user=self.creator_in_group,
            data={"shortcode": 'Name_B'},
            content_type=self.JSON_CONTENT
        )
        response = self.assertRequestPatchView(
            url, 200,
            user=self.creator_in_group,
            data={
                "description": "Updated description",
                "type": IndicatorType.STRING,
                "style_type": StyleType.DYNAMIC_QUANTITATIVE
            },
            content_type=self.JSON_CONTENT
        )
        obj = Indicator.objects.get(id=self.resource_3.id)
        self.assertEqual(obj.name, 'Name C')
        self.assertEqual(obj.group.name, 'Group 3')
        self.assertEqual(obj.description, 'Updated description')
        self.assertEqual(response.json()['description'], 'Updated description')
        self.assertEqual(obj.type, IndicatorType.STRING)
        self.assertEqual(response.json()['type'], IndicatorType.STRING)
        self.assertEqual(obj.style_type, StyleType.DYNAMIC_QUANTITATIVE)
        self.assertEqual(
            response.json()['style_type'], StyleType.DYNAMIC_QUANTITATIVE
        )

    def test_destroy_api(self):
        """Test DESTROY API."""
        id = self.resource_1.id
        self.check_delete_resource_with_different_users(
            id, 'indicators-detail')
        self.assertIsNone(Indicator.objects.filter(id=id).first())

        id = self.resource_3.id
        self.check_delete_resource_with_different_users(
            id, 'indicators-detail'
        )
        self.assertIsNone(Indicator.objects.filter(id=id).first())

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name A',
            group=IndicatorGroup.objects.create(name='Group 1')
        )
        resource_2 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name B',
            group=IndicatorGroup.objects.create(name='Group 2'),
            description='This is test'
        )
        resource_3 = Indicator.permissions.create(
            user=self.resource_creator,
            name='Name C',
            group=IndicatorGroup.objects.create(name='Group 3'),
            description='Resource 3'
        )
        resource_1.permission.update_user_permission(
            self.creator, PERMISSIONS.SHARE
        )
        resource_2.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST
        )
        resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.OWNER
        )
        params = urllib.parse.urlencode(
            {
                'sort': 'id'
            }
        )
        url = reverse('indicators-list') + '?' + params
        response = self.assertRequestGetView(
            url, 200, user=self.creator
        )
        self.assertEqual(len(response.json()['results']), 4)
        self.assertRequestDeleteView(
            url, 204, user=self.creator, data={
                'ids': [resource_1.id, resource_2.id, resource_3.id]
            }
        )
        response = self.assertRequestGetView(
            url, 200, user=self.creator
        )
        self.assertEqual(len(response.json()['results']), 3)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_3.id, resource_1.id, resource_2.id
            ]
        )
