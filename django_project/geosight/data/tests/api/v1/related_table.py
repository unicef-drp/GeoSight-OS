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

from geosight.data.models import RelatedTable, RelatedTableField
from geosight.permission.models import PERMISSIONS
from geosight.permission.tests import BasePermissionTest


class RelatedTableApiTest(BasePermissionTest, TestCase):  # noqa: D101
    def setUp(self):  # noqa: D102
        super().setUp()

        self.resource_1 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name A',
        )
        self.resource_1.add_field('my_number', 'My Number', 'number')
        self.resource_1.add_field('my_date', 'My Date', 'date')
        self.resource_1.add_field('my_string', 'My String', 'string')

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

    def test_delete(self):
        """Test DELETE /related-tables/{id} ."""
        id = self.resource_1.id
        assert len(RelatedTableField.objects.filter(related_table_id=id)) == 3
        self.check_delete_resource_with_different_users(
            id, 'related-tables-detail')
        self.assertIsNone(RelatedTable.objects.filter(id=id).first())
        assert len(RelatedTableField.objects.filter(related_table_id=id)) == 0

    def test_detail_api(self):
        """Test GET /related-tables/{id} ."""
        url = reverse('related-tables-detail', args=[0])

        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 404, user=self.viewer)
        self.assertRequestGetView(url, 404, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse('related-tables-detail',
                      kwargs={'id': self.resource_1.id}) + '?all_fields=true'
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        assert validate_related_table(response.json(), self.resource_1)

    def create_resource(self, user):  # noqa: D102
        return None


def fields_match(json, resource):
    """Check if the field definition from a JSON and a model match."""
    return (json['name'] == resource['name'] and
            json['label'] == resource['alias'] and
            json['type'] == resource['type'])


def all_fields_match(json, resource):
    """Check all the field definitions in the JSON against the model."""
    json_definitions = json['fields_definition']
    if len(json_definitions) != len(resource.fields_definition):
        return False

    for definition in resource.fields_definition:
        if all(not fields_match(json_field, definition)
               for json_field in json_definitions):
            return False
    return True


def validate_related_table(json, resource):
    """Validate json dict against resource."""
    return (json['id'] == resource.id and
            json['name'] == resource.name and
            json.get('description') == resource.description and
            json['url'] == f'/api/v1/related-tables/{resource.id}/' and
            json.get('creator') == resource.creator.get_full_name() and
            to_datetime(json, 'created_at') == resource.created_at and
            to_datetime(json, 'modified_at') == resource.modified_at and
            all_fields_match(json, resource))


def to_datetime(json, attribute) -> datetime.datetime:
    """Convert a json attribute into a datetime."""
    date = json.get(attribute)
    return parser.parse(date) if date else None
