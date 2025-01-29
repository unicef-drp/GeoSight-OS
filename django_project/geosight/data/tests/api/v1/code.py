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
__date__ = '29/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import urllib.parse

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.code import (
    Code, CodeList, CodeInCodeList
)
from geosight.data.tests.model_factories.code import (
    CodeF, CodeListF, CodeInCodeList, CodeInCodeListF
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class CodeAPITest(BasePermissionTest.TestCase):
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
        self.code_in_code_list_1 = CodeInCodeListF.create()
        self.code_in_code_list_2 = CodeInCodeListF.create(
            code=CodeF.create(),
            codelist=self.code_in_code_list_1.codelist
        )

    def test_list_api_by_permission(self):
        """Test List API."""
        url = reverse('codelist-list')
        self.assertRequestGetView(url, 403)

        response = self.assertRequestGetView(url, 200, user=self.admin)
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(url, 200, user=self.creator)
        self.assertEqual(len(response.json()['results']), 1)

        response = self.assertRequestGetView(
            url, 200, user=self.creator_in_group
        )
        self.assertEqual(len(response.json()['results']), 1)

        expected_response = {
            "count": 1,
            "next": None,
            "previous": None,
            "results": [
                {
                    "id": self.code_in_code_list_1.codelist_id,
                    "name": self.code_in_code_list_1.codelist.name,
                    "description": self.code_in_code_list_1.codelist.description,
                    "codes": [
                        {
                            "id": self.code_in_code_list_1.code_id,
                            "name": self.code_in_code_list_1.code.name,
                            "description": self.code_in_code_list_1.code.description,
                            "value": self.code_in_code_list_1.code.value,
                        },
                        {
                            "id": self.code_in_code_list_2.code_id,
                            "name": self.code_in_code_list_2.code.name,
                            "description": self.code_in_code_list_2.code.description,
                            "value": self.code_in_code_list_2.code.value,
                        },
                    ],
                }
            ],
        }
        self.assertEqual(response.json(), expected_response)

    def test_list_api_by_filter(self):
        """Test GET LIST API."""
        # Resource layer attribute
        code_list_custom = CodeListF.create(
            name="Some code list"
        )
        code_in_code_list_3 = CodeInCodeListF.create(
            codelist=code_list_custom,
        )
        code_in_code_list_4 = CodeInCodeListF.create(
            codelist=code_list_custom,
        )

        params = urllib.parse.urlencode(
            {
                'name__contains': 'some'
            }
        )
        url = reverse('codelist-list') + '?' + params
        response = self.assertRequestGetView(url, 200, user=self.viewer)
        self.assertEqual(len(response.json()['results']), 1)
        expected_response = {
            "count": 1,
            "next": None,
            "previous": None,
            "results": [
                {
                    "id": code_list_custom.id,
                    "name": code_list_custom.name,
                    "description": code_list_custom.description,
                    "codes": [
                        {
                            "id": code_in_code_list_3.code_id,
                            "name": code_in_code_list_3.code.name,
                            "description": code_in_code_list_3.code.description,
                            "value": code_in_code_list_3.code.value,
                        },
                        {
                            "id": code_in_code_list_4.code_id,
                            "name": code_in_code_list_4.code.name,
                            "description": code_in_code_list_4.code.description,
                            "value": code_in_code_list_4.code.value,
                        },
                    ],
                }
            ],
        }
        self.assertEqual(response.json(), expected_response)

    def test_create_codelist(self):
        """Test create codelist."""
        url = reverse('codelist-list')
        payload = {
          "name": "Test Code List 1",
          "description": "Test Code List Description 1",
          "codes": [
            {
              "name": "Code 1",
              "description": "Code Description 1",
              "value": "Code Value 1"
            },
            {
              "name": "Test Code 1",
              "description": "Test Code Description 1",
              "value": "Test Code Value 1"
            }
          ]
        }

        # Test admin create
        response = self.assertRequestPostView(
            url=url,
            code=201,
            data=payload,
            user=self.admin,
            content_type='application/json'
        )

        code_list = CodeList.objects.filter(name="Test Code List 1")
        self.assertTrue(code_list.exists())

        code_1 = Code.objects.filter(name="Code 1")
        self.assertTrue(code_1.exists())

        code_2 = Code.objects.filter(name="Test Code 1")
        self.assertTrue(code_2.exists())

        expected_response = {
            'id': code_list.first().id,
            'name': code_list.first().name,
            'description': code_list.first().description,
            'codes': [
                {
                    'id': code_1.first().id,
                    'name': code_1.first().name,
                    'description': code_1.first().description,
                    'value': code_1.first().value
                },
                {
                    'id': code_2.first().id,
                    'name': code_2.first().name,
                    'description': code_2.first().description,
                    'value': code_2.first().value
                }
            ]
        }
        self.assertEqual(response.json(), expected_response)

        # Test non admin create
        self.assertRequestPostView(
            url=url,
            code=403,
            data=payload,
            user=self.creator,
            content_type='application/json'
        )

    def test_add_code(self):
        """Test add code to codelist."""
        code_in_code_list = CodeInCodeListF.create()
        url = reverse(
            'codelist-codes',
            args=[code_in_code_list.codelist_id]
        )
        payload = {
          "name": "New Code",
          "description": "New Code Description",
          "value": "New Code Value"
        }

        # Test admin create
        response = self.assertRequestPostView(
            url=url,
            code=201,
            data=payload,
            user=self.admin,
            content_type='application/json'
        )

        codes = code_in_code_list.codelist.codes()
        self.assertEqual(len(codes), 2)

        expected_response = {
            'id': codes[1].id,
            'name': "New Code",
            "description": "New Code Description",
            "value": "New Code Value"
        }
        self.assertEqual(response.json(), expected_response)

        # Test non admin create
        self.assertRequestPostView(
            url=url,
            code=403,
            data=payload,
            user=self.creator,
            content_type='application/json'
        )
