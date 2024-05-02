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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.urls import reverse
from django_tenants.test.client import TenantClient as Client

from core.tests.base_tests import TenantTestCase as TestCase
from core.tests.model_factories import UserF
from geosight.data.models.indicator import Indicator
from geosight.data.tests.model_factories import IndicatorF, IndicatorGroupF


class IndicatorDetailApiTest(TestCase):
    """Test for Indicator detail api."""

    def setUp(self):
        """To setup test."""
        name = 'Indicator 1'
        group = IndicatorGroupF()
        self.indicator = IndicatorF(
            name=name,
            group=group
        )
        self.url = reverse(
            'indicator-detail-api', kwargs={
                'pk': self.indicator.pk
            }
        )

    def test_delete_indicator_view_no_login(self):
        """Test delete indicator with no login."""
        client = Client(self.tenant)
        response = client.delete(self.url)
        self.assertEquals(response.status_code, 403)

    def test_delete_indicator_view_not_staff(self):
        """Test delete indicator with as non staff."""
        username = 'test'
        password = 'testpassword'
        UserF(username=username, password=password, is_superuser=False)
        client = Client(self.tenant)
        client.login(username=username, password=password)
        response = client.delete(self.url)
        self.assertEquals(response.status_code, 403)

    def test_delete_indicator_view_staff(self):
        """Test delete indicator with as staff."""
        username = 'staff'
        password = 'staffpassword'
        UserF(username=username, password=password, is_superuser=True)
        client = Client(self.tenant)
        client.login(username=username, password=password)
        response = client.delete(self.url)
        self.assertEquals(response.status_code, 200)
        self.assertFalse(
            Indicator.objects.filter(
                pk=self.indicator.pk
            ).first()
        )
