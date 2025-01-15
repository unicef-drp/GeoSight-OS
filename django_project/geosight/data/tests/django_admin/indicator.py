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

from django.contrib.auth import get_user_model

from geosight.data.models.indicator import (
    Indicator, IndicatorType, IndicatorStyleType
)
from geosight.data.tests.django_admin._base import BaseDjangoAdminTest

User = get_user_model()


class IndicatorAdminViewTest(BaseDjangoAdminTest.TestCase):
    """Test for Indicator Django Admin."""

    list_url_tag = 'admin:geosight_data_indicator_changelist'
    create_url_tag = 'admin:geosight_data_indicator_add'
    edit_url_tag = 'admin:geosight_data_indicator_change'
    payload = {
        'name': 'name',
        'group': '',
        'shortcode': 'SHORT',
        'style_type': IndicatorStyleType.DYNAMIC_QUANTITATIVE,
        'type': IndicatorType.FLOAT,
        'label_config': '',
        'style_config': '',
        'version_data': '2025-01-01 01:01:01',
        'source': 'Sample Source',
    }
    style_config = {
        "sync_filter": "on",
        "no_data_rule": {
            "name": "No data",
            "rule": "No data",
            "color": "#D8D8D8",
            "active": "true",
            "outline_size": "0.5",
            "outline_color": "#FFFFFF"
        },
        "outline_size": 0.5, "sync_outline": False,
        "color_palette": 1, "outline_color": "#FFFFFF",
        "dynamic_class_num": "7",
        "color_palette_reverse": False,
        "dynamic_classification": "Natural breaks."
    }
    form_payload = {}

    def setUp(self):
        super().setUp()
        self.form_payload = copy.deepcopy(self.payload)
        self.form_payload.update({
            'indicatorrule_set-TOTAL_FORMS': 0,
            'indicatorrule_set-INITIAL_FORMS': 0,
            'version_data_0': '2025-01-01',
            'version_data_1': '01:01:01',
        })

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        payload['style_config'] = self.style_config
        del payload['group']
        payload['shortcode'] += (
            f"{payload['shortcode']}-{Indicator.objects.count()}"
        )
        return Indicator.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return Indicator.permissions.list(user).order_by('id')
