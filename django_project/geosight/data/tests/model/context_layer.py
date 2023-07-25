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

from django.test.testcases import TestCase

from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.tests.model_factories import ContextLayerF


class BasemapLayerTest(TestCase):
    """Test for Basemap model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Context Layer 1'
        self.params = {
            'param 1': 'value 1',
            'param 2': 'value 2',
            'param 3': 'value 3',
        }
        self.style = {
            'style 1': 'value 1',
            'style 2': 'value 2',
            'style 3': 'value 3',
        }

    def test_create(self):
        """Test create."""
        context_layer = ContextLayerF(
            name=self.name,
            url='test?' + '&'.join(
                [f'{key}={value}' for key, value in self.params.items()]
            )
        )

        context_layer_data = ContextLayerSerializer(context_layer).data
        self.assertEquals(context_layer_data['name'], self.name)
        for key, value in context_layer_data['parameters'].items():
            self.assertEquals(self.params[key], value)
