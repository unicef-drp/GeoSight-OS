import datetime

from dateutil import parser
from django.test.testcases import TestCase
from rest_framework.reverse import reverse

from geosight.data.models import RelatedTable
from geosight.permission.models import PERMISSIONS
from geosight.permission.tests import BasePermissionTest


class RelatedTableApiTest(BasePermissionTest, TestCase):
    def setUp(self):
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
        self.resource_3.permission.update_user_permission(self.creator, PERMISSIONS.LIST)
        self.resource_3.permission.update_group_permission(self.group, PERMISSIONS.OWNER)

    def test_list(self):
        url = reverse('related-tables-list') + '?all_fields=true'
        self.assertRequestGetView(url, 403)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertResponseContainsList(
            response, validate_related_table, self.resource_1, self.resource_2, self.resource_3
        )

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(url, 200, user=self.creator_in_group)
        self.assertEqual(len(response.json()), 1)

    def test_detail_api(self):
        url = reverse('related-tables-detail', args=[0])
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 404, user=self.viewer)
        self.assertRequestGetView(url, 404, user=self.creator)
        self.assertRequestGetView(url, 404, user=self.admin)

        url = reverse('related-tables-detail', kwargs={'id': self.resource_3.id}) + '?all_fields=true'
        self.assertRequestGetView(url, 403)
        self.assertRequestGetView(url, 403, user=self.viewer)
        self.assertRequestGetView(url, 403, user=self.creator)
        response = self.assertRequestGetView(url, 200, user=self.admin)

        assert validate_related_table(response.json(), self.resource_3)

    def create_resource(self, user):
        return None


def validate_related_table(json, resource):
    return (json['id'] == resource.id
            and json['name'] == resource.name
            and json.get('description') == resource.description
            and json['url'] == f'/api/v1/related-tables/{resource.id}/'
            and json.get('creator') == resource.creator.get_full_name()
            and to_datetime(json, 'created_at') == resource.created_at
            and to_datetime(json, 'modified_at') == resource.modified_at)


def to_datetime(json, attribute) -> datetime.datetime:
    date = json.get(attribute)
    return parser.parse(date) if date else None
