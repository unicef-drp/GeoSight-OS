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

from core.tests.base_tests import TenantTestCase as TestCase

from geosight.data.tests.model_factories import LinkF


class LinkTest(TestCase):
    """Test for Link model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Link1'

    def test_create(self):
        """Test create."""
        link = LinkF(
            name=self.name
        )
        self.assertEquals(link.name, self.name)
