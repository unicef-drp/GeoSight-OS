"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '29/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

import datetime

from dateutil import parser
from django.test.testcases import TestCase
from rest_framework.reverse import reverse

from geosight.data.models import RelatedTable
from geosight.permission.models import PERMISSIONS
from geosight.permission.tests import BasePermissionTest


class RelatedTableApiTest(BasePermissionTest, TestCase):  # noqa: D101
    def setUp(self):  # noqa: D102
        super().setUp()

        self.resource_1 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name A',
        )
        self.resource_2 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name B',
            description='This is test',
        )
        self.resource_3 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name C',
            description='Resource 3',
        )
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST)
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER)

    def test_list(self):
        """Test GET /related-tables/ ."""
        url = reverse('related-tables-list') + '?all_fields=true'
        self.assertRequestGetView(url, 403)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertResponseContainsPaginatedList(
            response, validate_related_table,
            self.resource_1, self.resource_2, self.resource_3
        )

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json().get('results')), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json().get('results')), 1)

        response = self.assertRequestGetView(url, 200,
                                             user=self.creator_in_group)
        self.assertEqual(len(response.json().get('results')), 1)

    def create_resource(self, user):  # noqa: D102
        return None


def validate_related_table(json, resource):
    """Validate json dict against resource."""
    return (json['id'] == resource.id and
            json['name'] == resource.name and
            json.get('description') == resource.description and
            json['url'] == f'/api/v1/related-tables/{resource.id}/' and
            json.get('creator') == resource.creator.get_full_name() and
            to_datetime(json, 'created_at') == resource.created_at and
            to_datetime(json, 'modified_at') == resource.modified_at)


def to_datetime(json, attribute) -> datetime.datetime:
    """Convert a json attribute into a datetime."""
    date = json.get(attribute)
    return parser.parse(date) if date else None
