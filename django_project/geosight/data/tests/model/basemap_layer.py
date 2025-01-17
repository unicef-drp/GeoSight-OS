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

import urllib.parse

from core.tests.base_tests import TestCase, BaseFileCleanupTest
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.data.tests.model_factories import (
    BasemapLayerF, BasemapLayerParameterF
)


class BasemapLayerTest(TestCase):
    """Test for Basemap model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Base Map 1'
        self.params = {
            'param 1': 'value 1',
            'param 2': 'value 2',
            'param 3': 'value 3',
        }

    def test_create(self):
        """Test create."""
        basemap = BasemapLayerF(
            name=self.name
        )

        for name, value in self.params.items():
            BasemapLayerParameterF(
                basemap_layer=basemap,
                name=name,
                value=value
            )

        basemap_data = BasemapLayerSerializer(basemap).data
        self.assertEquals(basemap_data['name'], self.name)
        for key, value in basemap_data['parameters'].items():
            self.assertEquals(urllib.parse.quote(self.params[key]), value)


class BasemapCleanupTest(BaseFileCleanupTest.TestCase):
    model = BasemapLayerF

    def create_test_object(self):
        self.test_obj = self.model()
