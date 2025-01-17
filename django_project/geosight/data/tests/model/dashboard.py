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
__date__ = '06/24/2025'
__copyright__ = ('Copyright 2025, Unicef')

import os
from django.core.files.base import ContentFile

from core.tests.base_tests import TestCase
from geosight.data.tests.model_factories import DashboardF


class DashboardTest(TestCase):
    """Test for Dashboard model."""

    def setUp(self):
        """Prepare test data."""
        self.dashboard = DashboardF()
        self.icon_path = (
            "/home/web/django_project/geosight/"
            "data/tests/data/uniced_acled_wpop.png"
        )

    def _update_icon(self):
        with open(self.icon_path, "rb") as f:
            image_data = f.read()

        # Create a ContentFile object
        content_file = ContentFile(image_data, name="uploaded_image.jpg")
        self.dashboard.icon.save("uniced_acled_wpop.png", content_file)
        self.dashboard.save()
        self.dashboard.refresh_from_db()

    def test_create_thumbnail(self):
        """Test create thumbnail."""
        # Update dashboard icon
        self._update_icon()

        old_thumbnail = self.dashboard.thumbnail.path
        self.assertIsNotNone(self.dashboard.icon.name)

        # Update dashboard icon again
        self._update_icon()

        # Check old thumbnail is removed
        self.assertFalse(os.path.exists(old_thumbnail))

        # Check that file is set and the size is less
        # than 20% the original size
        self.assertTrue(
            os.path.getsize(
                self.dashboard.thumbnail.path
            ) < 0.2 * os.path.getsize(
                self.icon_path
            )
        )
