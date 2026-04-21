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
__date__ = '21/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

import json
from django.contrib.auth import get_user_model
from django.urls import reverse

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import Dashboard
from geosight.data.serializer.dashboard_relation import (
    DashboardContextLayerSerializer
)
from geosight.data.tests.model_factories.dashboard.dashboard_indicator_layer import (  # noqa: E501
    DashboardIndicatorLayerF,
    DashboardIndicatorLayerIndicatorF,
    DashboardIndicatorLayerRelatedTableF,
)
from geosight.data.tests.model_factories.dashboard.dashboard_relation import (
    DashboardContextLayerF,
)
from geosight.data.tests.model_factories.context_layers import ContextLayerF
from geosight.data.tests.model_factories.indicator.indicator import IndicatorF
from geosight.data.tests.model_factories.related_table import RelatedTableF
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.manager import PermissionException
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardLayerTestTest(BasePermissionTest.TestCase):
    """Test for context dashboard data api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name=name
        )

    # ------------------------------------------------------------------
    # DashboardIndicatorLayer: label property
    # ------------------------------------------------------------------

    def test_indicator_layer_label_override_name(self):
        """label returns obj.name when override_name is True."""
        layer = DashboardIndicatorLayerF.create(
            name='Custom Name', override_name=True
        )
        self.assertEqual(layer.label, 'Custom Name')

    def test_indicator_layer_label_fallback_to_related_table(self):
        """label returns related table name when override_name is False."""
        layer = DashboardIndicatorLayerF.create(
            name='Custom Name', override_name=False
        )
        related_table = RelatedTableF.create(name='Related Table Name')
        DashboardIndicatorLayerRelatedTableF.create(
            object=layer, related_table=related_table
        )
        self.assertEqual(layer.label, 'Related Table Name')

    def test_indicator_layer_label_fallback_to_indicator(self):
        """label returns indicator name when override_name is False and no related table."""  # noqa: E501
        layer = DashboardIndicatorLayerF.create(
            name='Custom Name', override_name=False
        )
        indicator = IndicatorF.create(name='Indicator Name')
        DashboardIndicatorLayerIndicatorF.create(
            object=layer, indicator=indicator
        )
        self.assertEqual(layer.label, 'Indicator Name')

    def test_indicator_layer_label_fallback_empty(self):
        """label returns empty string when override_name is False and no linked objects."""  # noqa: E501
        layer = DashboardIndicatorLayerF.create(
            name='Custom Name', override_name=False
        )
        self.assertEqual(layer.label, '')

    # ------------------------------------------------------------------
    # DashboardIndicatorLayer: desc property
    # ------------------------------------------------------------------

    def test_indicator_layer_desc_override_description(self):
        """desc returns obj.description when override_description is True."""
        layer = DashboardIndicatorLayerF.create(
            description='Custom Desc', override_description=True
        )
        self.assertEqual(layer.desc, 'Custom Desc')

    def test_indicator_layer_desc_fallback_to_related_table(self):
        """desc returns related table description when override_description is False."""  # noqa: E501
        layer = DashboardIndicatorLayerF.create(
            description='Custom Desc', override_description=False
        )
        related_table = RelatedTableF.create(description='Related Table Desc')
        DashboardIndicatorLayerRelatedTableF.create(
            object=layer, related_table=related_table
        )
        self.assertEqual(layer.desc, 'Related Table Desc')

    def test_indicator_layer_desc_fallback_to_indicator(self):
        """desc returns indicator description when override_description is False and no related table."""  # noqa: E501
        layer = DashboardIndicatorLayerF.create(
            description='Custom Desc', override_description=False
        )
        indicator = IndicatorF.create(
            name='Indicator', description='Indicator Desc'
        )
        DashboardIndicatorLayerIndicatorF.create(
            object=layer, indicator=indicator
        )
        self.assertEqual(layer.desc, 'Indicator Desc')

    def test_indicator_layer_desc_fallback_empty(self):
        """desc returns empty string when override_description is False and no linked objects."""  # noqa: E501
        layer = DashboardIndicatorLayerF.create(
            description='Custom Desc', override_description=False
        )
        self.assertEqual(layer.desc, '')

    # ------------------------------------------------------------------
    # DashboardContextLayerSerializer: name / description (resolved)
    # ------------------------------------------------------------------

    def test_context_layer_serializer_name_override(self):
        """name returns override value when override_layer_name is True."""
        context_layer = ContextLayerF.create(name='Original Name')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_name='Overridden Name',
            override_layer_name=True,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['name'], 'Overridden Name')

    def test_context_layer_serializer_name_fallback(self):
        """name returns linked object name when override_layer_name is False."""
        context_layer = ContextLayerF.create(name='Original Name')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_name='Overridden Name',
            override_layer_name=False,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['name'], 'Original Name')

    def test_context_layer_serializer_description_override(self):
        """description returns override value when override_layer_description is True."""  # noqa: E501
        context_layer = ContextLayerF.create(description='Original Desc')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_description='Overridden Desc',
            override_layer_description=True,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['description'], 'Overridden Desc')

    def test_context_layer_serializer_description_fallback(self):
        """description returns linked object description when override_layer_description is False."""  # noqa: E501
        context_layer = ContextLayerF.create(description='Original Desc')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_description='Overridden Desc',
            override_layer_description=False,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['description'], 'Original Desc')

    # ------------------------------------------------------------------
    # DashboardContextLayerSerializer: raw fields
    # ------------------------------------------------------------------

    def test_context_layer_serializer_layer_name_raw(self):
        """layer_name always returns the raw stored override value."""
        context_layer = ContextLayerF.create(name='Original Name')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_name='Overridden Name',
            override_layer_name=False,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['layer_name'], 'Overridden Name')

    def test_context_layer_serializer_object_name(self):
        """object_name always returns the linked ContextLayer name."""
        context_layer = ContextLayerF.create(name='Original Name')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_name='Overridden Name',
            override_layer_name=True,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(serializer.data['object_name'], 'Original Name')

    def test_context_layer_serializer_object_description(self):
        """object_description always returns the linked ContextLayer description."""  # noqa: E501
        context_layer = ContextLayerF.create(description='Original Desc')
        dcl = DashboardContextLayerF.create(
            object=context_layer,
            layer_description='Overridden Desc',
            override_layer_description=True,
        )
        serializer = DashboardContextLayerSerializer(dcl)
        self.assertEqual(
            serializer.data['object_description'], 'Original Desc'
        )
