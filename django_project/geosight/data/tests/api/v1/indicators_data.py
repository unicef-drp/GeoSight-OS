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
__date__ = '24/11/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import reverse

from geosight.data.tests.api.v1.indicator_value.base import BaseDataBrowserTest
from geosight.permission.models.factory import PERMISSIONS


class IndicatorsDataStatisticApiTest(BaseDataBrowserTest.TestCase):
    """Test for statistic action of indicators data api."""

    def setUp(self):
        """To setup test."""
        super().setUp()
        permission = self.indicator_1.permission
        permission.public_permission = PERMISSIONS.READ_DATA.name
        permission.save()
        self.url = (
            f"{reverse('indicators_data-statistic')}"
            f"?indicator_id__in={self.indicator_1.id}"
            f"&aggregate_methods=count"
        )

    def test_group_by_allowed_field(self):
        """Test group_by with allowed fields."""
        response = self.assertRequestGetView(
            f'{self.url}&group_by=indicator_id', 200
        )
        self.assertEqual(
            response.json(),
            [{'indicator_id': self.indicator_1.id, 'count': 18}]
        )
        response = self.assertRequestGetView(
            f'{self.url}&group_by=geom_id, admin_level', 200,
            user=self.admin
        )
        for row in response.json():
            self.assertEqual(
                set(row.keys()), {'geom_id', 'admin_level', 'count'}
            )

    def test_group_by_related_field(self):
        """Test group_by can't read fields of related models."""
        for group_by in [
            'indicator__creator__password',
            'indicator__creator__email',
            'indicator__creator__username',
            'indicator_id,indicator__creator__password',
            'entity__geom_id',
        ]:
            for user in [None, self.admin]:
                response = self.assertRequestGetView(
                    f'{self.url}&group_by={group_by}', 400, user=user
                )
                self.assertNotIn(b'pbkdf2', response.content)

    def test_group_by_unknown_field(self):
        """Test group_by with unknown field returns 400 instead of 500."""
        for group_by in ['foo', 'extra_value', 'value']:
            self.assertRequestGetView(
                f'{self.url}&group_by={group_by}', 400, user=self.admin
            )
