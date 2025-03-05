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
__date__ = '17/02/2025'
__copyright__ = ('Copyright 2025, Unicef')

import json
import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.importer.models import Importer
from geosight.importer.tests.importers.model_factories.importer import (
    ImporterFactory,
    ImportType,
    InputFormat
)
from geosight.permission.tests._base import BasePermissionTest
from django_celery_beat.models import PeriodicTask

User = get_user_model()


class StylePermissionTest(BasePermissionTest.TestCase):
    """Test for Style API."""

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
        self.resource_1 = ImporterFactory.create(
            creator=self.creator,
            job_name='Job 1',
            job=PeriodicTask.objects.first(),
        )
        self.resource_2 = ImporterFactory.create(
            creator=self.admin,
            job_name='Job 2',
            input_format=InputFormat.EXCEL_WIDE,
            import_type=ImportType.RELATED_TABLE,
            job=PeriodicTask.objects.first()
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('scheduled-job-list-api')
        self.assertRequestGetView(url, 200)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 0)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 0)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'job_name__icontains': 'b 2'
            }
        )

        url = reverse('scheduled-job-list-api') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

        params = urllib.parse.urlencode(
            {
                'import_type': ImportType.RELATED_TABLE,
            }
        )
        url = reverse('scheduled-job-list-api') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(
            response.json()['results'][0]['id'], self.resource_2.id
        )

    def test_list_api_sort(self):
        """Test GET LIST API."""
        params = urllib.parse.urlencode(
            {
                'sort': 'job_name'
            }
        )
        url = reverse('scheduled-job-list-api') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_1.id, self.resource_2.id,
            ]
        )
        params = urllib.parse.urlencode(
            {
                'sort': '-job_name'
            }
        )
        url = reverse('scheduled-job-list-api') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 2)
        ids = []
        for result in response.json()['results']:
            ids.append(result['id'])
        self.assertEqual(
            ids, [
                self.resource_2.id, self.resource_1.id
            ]
        )

    def test_delete_api(self):
        """Test DELETE API."""
        url = reverse('scheduled-job-list-api')
        self.assertRequestDeleteView(
            url, 200, user=self.admin, data={
                'ids': json.dumps([self.resource_1.id, self.resource_2.id])
            }
        )
        self.assertFalse(
            Importer.objects.exists()
        )

    def test_put_api(self):
        """Test PUT API."""
        url = reverse('scheduled-job-list-api')
        self.assertRequestPutView(
            url, 200, user=self.admin, data={
                'ids': json.dumps([self.resource_1.id, self.resource_2.id]),
                'state': 'resume'
            }
        )
