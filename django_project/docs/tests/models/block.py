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
__date__ = '01/17/2025'
__copyright__ = ('Copyright 2025, Unicef')

from docs.models import Block
from core.tests.base_tests import BaseFileCleanupTest


class BlockCleanupTest(BaseFileCleanupTest.TestCase):
    model = Block

    def create_test_object(self):
        self.test_obj = self.model.objects.create()
