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
import urllib.parse

from dateutil import parser
from rest_framework.reverse import reverse

from geosight.data.models import (
    RelatedTable, RelatedTableField, RelatedTableRow
)
from geosight.permission.models import PERMISSIONS
from geosight.permission.tests import BasePermissionTest


def add_fields_and_rows_to_table(related_table):
    """Add 3 fields and 2 rows to the given related table."""
    related_table.add_field('my_number', 'My Number', 'number')
    related_table.add_field('my_date', 'My Date', 'date')
    related_table.add_field('my_string', 'My String', 'string')
    related_table.insert_rows([{
        'mynumber': 42.7,
        'my_date': '2024-02-12T00:00:00Z',
        'my_string': 'Hello'
    }, {
        'mynumber': -1.0,
        'my_date': '2024-02-13T00:00:00Z',
        'my_string': 'Bye'
    }])


class RelatedTableApiTest(BasePermissionTest.TestCase):  # noqa: D101
    def setUp(self):  # noqa: D102
        super().setUp()

        self.resource_1 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name A',
        )
        add_fields_and_rows_to_table(self.resource_1)

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
        url = reverse('related_tables-list') + '?fields=__all__'
        resource = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name Public'
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

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertResponseContainsPaginatedList(
            response, validate_related_table,
            self.resource_1, self.resource_2, self.resource_3, resource
        )

        # Search
        params = urllib.parse.urlencode(
            {
                'q': 'Resource '
            }
        )
        url = reverse('related_tables-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['name'], 'Name C')

    def test_delete(self):
        """Test DELETE /related-tables/{id} ."""
        id = self.resource_1.id
        assert len(RelatedTableField.objects.filter(related_table_id=id)) == 3
        assert len(RelatedTableRow.objects.filter(table_id=id)) == 2
        self.check_delete_resource_with_different_users(
            id, 'related_tables-detail')
        self.assertIsNone(RelatedTable.objects.filter(id=id).first())
        assert len(RelatedTableRow.objects.filter(table_id=id)) == 0

    def test_detail_api(self):
        """Test GET /related-tables/{id} ."""
        url = reverse('related_tables-detail', args=[0])

        self.assertRequestGetView(url, 404)
        self.assertRequestGetView(url, 404, user=self.viewer)
        self.assertRequestGetView(url, 404, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse(
            'related_tables-detail',
            kwargs={'id': self.resource_1.id}
        )
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        assert validate_related_table(response.json(), self.resource_1)

    def test_create(self):
        """Test POST /related-tables ."""
        url = reverse('related_tables-list')
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        # test missing mandatory
        self.assertRequestPostView(url, 400, user=self.creator, data={})
        # test invalid field type
        self.assertRequestPostView(
            url, 400, user=self.creator,
            data={
                "name": 'New name',
                "fields_definition": [{
                    "name": "field",
                    "label": "field",
                    "type": "invalid_type"
                }]
            },
            content_type=self.JSON_CONTENT
        )

        # test valid request
        response = self.assertRequestPostView(
            url, 201, user=self.creator,
            data={
                "name": 'My related table',
                "description": "Related table for tests",
                "fields_definition": [{
                    "name": "field_1",
                    "label": "field 1",
                    "type": "string"
                }, {
                    "name": "field_2",
                    "label": "field 2",
                    "type": "number"
                }, {
                    "name": "field_3",
                    "label": "field 3",
                    "type": "date"
                }]
            },
            content_type=self.JSON_CONTENT
        )

        json = response.json()
        obj = RelatedTable.objects.get(id=json['id'])

        assert obj.name == json['name'] == 'My related table'
        assert obj.description == json['description']
        assert obj.description == 'Related table for tests'
        assert json['url'] == f'/api/v1/related-tables/{obj.id}/'
        assert obj.creator.get_full_name() == json['creator']
        assert obj.created_at.strftime(
            '%Y-%m-%d %H:%M:%S'
        ) == json['created_at']
        assert obj.modified_at.strftime(
            '%Y-%m-%d %H:%M:%S'
        ) == json['modified_at']
        for index in range(0, len(obj.fields_definition)):
            db = obj.fields_definition[index]
            api = json['fields_definition'][index]
            assert db['name'] == api['name']
            assert db['alias'] == api['label']
            assert db['type'] == api['type']

    def test_update_api(self):
        """Test PUT /related-tables/{id} ."""
        url = reverse('related_tables-detail', args=[0])
        # invalid id
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 404, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        url = reverse(
            'related_tables-detail', kwargs={'id': self.resource_1.id}
        )
        # invalid permissions
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})

        # missing mandatory
        self.assertRequestPutView(url, 400, user=self.resource_creator,
                                  data={})
        # invalid field type
        self.assertRequestPutView(
            url, 400, user=self.resource_creator,
            data={
                "name": 'New name',
                "fields_definition": [{
                    "name": "field",
                    "label": "field",
                    "type": "invalid_type"
                }]
            },
            content_type=self.JSON_CONTENT
        )

        # valid request
        self.assertRequestPutView(
            url, 200,
            user=self.resource_creator,
            data={
                "name": 'Updated name',
                "fields_definition": [{
                    "name": "another_field",
                    "label": "Another field",
                    "type": "number"
                }]
            },
            content_type=self.JSON_CONTENT
        )

        saved = RelatedTable.objects.get(id=self.resource_1.id)
        assert saved.name == 'Updated name'
        assert len(saved.fields_definition) == 1
        assert saved.fields_definition[0].get('name') == 'another_field'
        assert saved.fields_definition[0].get('alias') == 'Another field'
        assert saved.fields_definition[0].get('type') == 'number'

    def create_resource(self, user):  # noqa: D102
        return None

    def test_delete_api(self):
        """Test DELETE API."""
        resource_1 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name A'
        )
        resource_2 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name B'
        )
        resource_3 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name C'
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
        url = reverse('related_tables-list') + '?' + params
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
            json.get('created_at') == resource.created_at.strftime(
                '%Y-%m-%d %H:%M:%S'
            ) and
            json.get('modified_at') == resource.modified_at.strftime(
                '%Y-%m-%d %H:%M:%S'
            ) and
            all_fields_match(json, resource))


def to_datetime(json, attribute) -> datetime.datetime:
    """Convert a json attribute into a datetime."""
    date = json.get(attribute)
    return parser.parse(date) if date else None
