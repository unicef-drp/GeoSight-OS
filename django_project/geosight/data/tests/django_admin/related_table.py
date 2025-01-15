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
__date__ = '15/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import copy
import json

from django.contrib.auth import get_user_model

from geosight.data.models.related_table import RelatedTable
from geosight.data.tests.django_admin._base import BaseDjangoAdminTest

User = get_user_model()


class RelatedTableAdminViewTest(BaseDjangoAdminTest.TestCase):
    """Test for RelatedTable Admin."""

    list_url_tag = 'admin:geosight_data_relatedtable_changelist'
    create_url_tag = 'admin:geosight_data_relatedtable_add'
    edit_url_tag = 'admin:geosight_data_relatedtable_change'

    payload = {
        'name': 'name',
        'description': 'description',
        'version_data': '2025-01-01 01:01:01',
        'data_fields': json.dumps([
            {
                'name': 'field_1',
                'alias': 'Field 1',
                'type': 'number',
            },
            {
                'name': 'field_2',
                'alias': 'Field 2',
                'type': 'string',
            },
            {
                'alias': 'Field 3',
                'type': 'string',
            },
            {
                'name': 'field_4',
                'type': 'string',
            },
            {
                'name': 'field_5',
                'alias': 'Field 5'
            },
        ])
    }
    form_payload = {}

    def setUp(self):
        """Prepare test data."""
        super().setUp()
        self.form_payload = copy.deepcopy(self.payload)
        self.form_payload.update({
            'relatedtablefield_set-TOTAL_FORMS': 0,
            'relatedtablefield_set-INITIAL_FORMS': 0,
            'version_data_0': '2025-01-01',
            'version_data_1': '01:01:01',
        })

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['data_fields']
        return RelatedTable.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return RelatedTable.permissions.list(user).order_by('id')
