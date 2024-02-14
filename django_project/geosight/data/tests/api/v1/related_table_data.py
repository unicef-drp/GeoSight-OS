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

from django.test.testcases import TestCase
from rest_framework.reverse import reverse
from rest_framework.status import HTTP_200_OK

from geosight.data.models import RelatedTable, RelatedTableRow
from geosight.data.tests.api.v1.related_table \
    import add_fields_and_rows_to_table
from geosight.permission.models import PERMISSIONS
from geosight.permission.tests import BasePermissionTest


class RelatedTableApiTest(BasePermissionTest, TestCase):  # noqa: D101
    def _add_fields_and_rows_to_table(self, resource):
        resource.add_field('my_number', 'My Number', 'number')

        resource.add_field('my_date', 'My Date', 'date')
        resource.add_field('my_string', 'My String', 'string')
        resource.insert_rows([{
            'mynumber': 42.7,
            'my_date': '2024-02-12T00:00:00Z',
            'my_string': 'Hello'
        }, {
            'mynumber': -1.0,
            'my_date': '2024-02-13T00:00:00Z',
            'my_string': 'Bye'
        }])

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
        add_fields_and_rows_to_table(self.resource_2)
        self.resource_3 = RelatedTable.permissions.create(
            user=self.resource_creator,
            name='Name C',
            description='Resource 3',
        )
        add_fields_and_rows_to_table(self.resource_3)
        self.resource_3.permission.update_user_permission(
            self.creator, PERMISSIONS.LIST)
        self.resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER)

    def test_list(self):
        """Test GET /related-tables/ ."""
        url = reverse('related_tables_data-list', args=[self.resource_1.id])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertResponseContainsPaginatedList(
            response, validate_related_table_row,
            *[row for row in self.resource_1.relatedtablerow_set.all()]
        )

    def test_update(self):
        """Test PUT /related-tables/{RT_id}/data/{id} ."""
        url = reverse('related_tables_data-detail', kwargs={
            'related_tables_id': self.resource_1.id,
            'id': 0
        })

        # invalid table permissions with invalid row id
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})
        self.assertRequestPutView(url, 404, user=self.admin, data={})

        data_id = self.resource_1.data[1].get('id')
        url = reverse('related_tables_data-detail', kwargs={
            'related_tables_id': self.resource_1.id,
            'id': data_id
        })
        # invalid table permissions with valid row id
        self.assertRequestPutView(url, 403, data={})
        self.assertRequestPutView(url, 403, user=self.viewer, data={})
        self.assertRequestPutView(url, 403, user=self.creator, data={})

        # missing mandatory
        self.assertRequestPutView(
            url, 400, user=self.resource_creator, data={}
        )

        # valid request
        response = self.assertRequestPutView(
            url, 200,
            user=self.resource_creator,
            data={
                "properties": {
                    'mynumber': 10.5,
                    'my_date': '2020-02-12T00:00:00Z',
                    'my_string': 'Updated string'
                }
            },
            content_type=self.JSON_CONTENT
        )

        assert response.status_code == HTTP_200_OK
        json = response.json()

        rows = (RelatedTable.objects.get(id=self.resource_1.id)
                .relatedtablerow_set.all())
        assert len(rows) == 2
        row = next(row for row in rows if row.id == json['id'])
        validate_related_table_row(json, row)

    def test_delete(self):
        """Test DELETE /related-tables/{RT_id}/data/{id} ."""
        id = self.resource_1.id
        row_id = RelatedTableRow.objects.filter(table_id=id).first().id
        assert len(RelatedTableRow.objects.filter(table_id=id)) == 2

        url = reverse('related_tables_data-detail', kwargs={
            'related_tables_id': id,
            'id': row_id
        })
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, user=self.viewer)
        self.assertRequestDeleteView(url, 403, user=self.creator)
        self.assertRequestDeleteView(url, 204, user=self.admin)

        rows = RelatedTableRow.objects.filter(table_id=id)
        assert len(rows) == 1
        assert rows.first().id != row_id

    def test_delete_all(self):
        """Test DELETE /related-tables/{RT_id}/data ."""
        id = self.resource_1.id
        assert len(RelatedTableRow.objects.filter(table_id=id)) == 2

        url = reverse('related_tables_data-list', kwargs={
            'related_tables_id': id
        })
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, user=self.viewer)
        self.assertRequestDeleteView(url, 403, user=self.creator)
        self.assertRequestDeleteView(url, 204, user=self.admin)
        assert len(RelatedTableRow.objects.filter(table_id=id)) == 0

    def test_create(self):
        """Test POST /related-tables/{RT_id}/data ."""
        url = reverse('related_tables_data-list', kwargs={
            'related_tables_id': self.resource_1.id
        })
        self.assertRequestPostView(url, 403, data={})
        self.assertRequestPostView(url, 403, user=self.viewer, data={})
        # test not an array
        self.assert_bad_request(url, {})
        # test empty array
        self.assert_bad_request(url, [])
        # test invalid object
        self.assert_bad_request(url, [{}])
        # test valid request
        response = self.assertRequestPostView(
            url, 201, user=self.admin,
            data=[{
                'properties': {
                    'mynumber': 42.7,
                    'my_date': '2024-02-12T00:00:00Z',
                    'my_string': 'Hello'
                }
            }, {
                'properties': {
                    'mynumber': -1.0,
                    'my_date': '2024-02-13T00:00:00Z',
                    'my_string': 'Bye'
                }
            }],
            content_type=self.JSON_CONTENT
        )

        json = response.json()
        rows = (RelatedTable.objects.get(id=self.resource_1.id)
                .relatedtablerow_set.all())
        assert len(rows) == 2 + 2  # 2 existing + 2 added in the tests
        row1 = next(row for row in rows if row.id == json[0]['id'])
        row2 = next(row for row in rows if row.id == json[1]['id'])
        assert json[0]['properties'] == row1.data
        assert json[1]['properties'] == row2.data

    def assert_bad_request(self, url, data):
        """Assert HTTP 400 for POST request using the given url/data."""
        self.assertRequestPostView(
            url, 400, user=self.creator, data=data,
            content_type=self.JSON_CONTENT
        )

    def create_resource(self, user):  # noqa: D102
        return None


def validate_related_table_row(json, row):
    """Validate json dict against resource."""
    return json['id'] == row.id and json['properties'] == row.data
