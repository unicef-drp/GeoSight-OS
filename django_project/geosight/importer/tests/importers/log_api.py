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

import json
from unittest.mock import patch

from django.urls import reverse

from core.models.profile import ROLES
from core.tests.base_tests import APITestCase
from core.tests.model_factories import create_user
from geosight.importer.models import Importer
from geosight.importer.models.attribute import ImporterAttribute
from geosight.importer.models.log import (
    ImporterLog, ImporterLogData, ImporterLogDataSaveProgress
)


class ImporterLogApiPermissionTest(APITestCase):
    """Test permission of importer log apis."""

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password
        )
        self.owner = create_user(ROLES.CREATOR.name, password=self.password)
        self.other_creator = create_user(
            ROLES.CREATOR.name, password=self.password
        )
        self.viewer = create_user(ROLES.VIEWER.name, password=self.password)

        self.importer = Importer.objects.create(
            import_type='Indicator Value',
            input_format='Excel Long Format',
            creator=self.owner
        )
        ImporterAttribute.objects.create(
            importer=self.importer, name='api_url',
            value='https://example.org/data?token=SECRET'
        )
        self.log = ImporterLog.objects.create(importer=self.importer)
        self.log_data = ImporterLogData.objects.create(
            log=self.log, data={'value': 1}
        )
        ImporterLogDataSaveProgress.objects.create(
            log=self.log, target_ids=[self.log_data.id]
        )

    def _assert_read_apis(self, code, user=None):
        """Assert all read apis of the log return the code."""
        for name in [
            'importer-log-detail-api',
            'importer-log-data-api',
            'importer-log-data-ids-api',
            'importer-log-data-save-progress-api',
        ]:
            response = self.assertRequestGetView(
                reverse(name, args=[self.log.id]), code, user=user
            )
            if code != 200:
                self.assertNotIn(b'SECRET', response.content)

    def test_read_permission(self):
        """Test only owner and admin can read the log."""
        self._assert_read_apis(403)
        self._assert_read_apis(403, self.viewer)
        self._assert_read_apis(403, self.other_creator)
        self._assert_read_apis(200, self.owner)
        self._assert_read_apis(200, self.admin)

    @patch('geosight.importer.api.log_data.run_save_log_data.delay')
    def test_save_data_permission(self, mock_delay):
        """Test only owner and admin can save the data of the log."""
        url = reverse('importer-log-data-api', args=[self.log.id])
        data = {'data': json.dumps([self.log_data.id])}
        self.assertRequestPostView(url, 403, data)
        self.assertRequestPostView(url, 403, data, user=self.viewer)
        self.assertRequestPostView(url, 403, data, user=self.other_creator)
        mock_delay.assert_not_called()
        self.assertRequestPostView(url, 200, data, user=self.owner)
        self.assertRequestPostView(url, 200, data, user=self.admin)
        self.assertEqual(mock_delay.call_count, 2)

    def test_filter_sensitive_fields(self):
        """Test sensitive fields can't be used to filter the log data."""
        url = reverse('importer-log-data-api', args=[self.log.id])
        response = self.assertRequestGetView(url, 200, user=self.owner)
        self.assertEqual(response.json()['count'], 1)
        for param in [
            'log__importer__creator__password__startswith=pbkdf2',
            'log__importer__creator__email__startswith=a',
            'log__importer__creator__profile__georepo_api_key__isnull=False',
        ]:
            self.assertRequestGetView(
                f'{url}?{param}', 400, user=self.owner
            )
