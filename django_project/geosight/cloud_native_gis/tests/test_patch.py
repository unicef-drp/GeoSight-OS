# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

THIS IS PLUGIN.
"""

__author__ = 'irwan@kartoza.com'
__date__ = '27/05/2026'
__copyright__ = ('Copyright 2023, Unicef')

import uuid
from unittest.mock import MagicMock, patch

from core.models.profile import ROLES
from core.tests.base_tests import TestCase
from core.tests.model_factories import create_user
from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.permission.models.factory import PERMISSIONS


def _make_request(user):
    """Return a minimal mock HttpRequest with the given user attached."""
    request = MagicMock()
    request.user = user
    return request


def _make_layer(layer_id=1):
    """Return a mock Layer with the minimal attributes used by the patch."""
    layer = MagicMock()
    layer.id = layer_id
    layer.unique_id = uuid.uuid4()
    layer.name = 'test-layer'
    layer.abstract = 'abstract'
    layer.schema_name = 'public'
    layer.table_name = f'layer_{str(layer.unique_id).replace("-", "_")}'
    return layer


class GetQuerysetPatchTest(TestCase):
    """Tests for the patched get_queryset function."""

    def setUp(self):
        """Create users and a ContextLayer backed by a cloud-native layer."""
        self.creator = create_user(ROLES.CREATOR.name)
        self.viewer = create_user(ROLES.VIEWER.name)

        self.context_layer = ContextLayer.permissions.create(
            user=self.creator,
            name='CNG Layer',
            url='http://example.com',
            layer_type=LayerType.ARCGIS,
        )
        self.context_layer.permission.organization_permission = PERMISSIONS.NONE
        self.context_layer.permission.save()

    @patch('geosight.cloud_native_gis.patch.Layer')
    def test_returns_layers_visible_to_user(self, MockLayer):
        """get_queryset filters to layers the user can list."""
        from geosight.cloud_native_gis.patch import get_queryset

        request = _make_request(self.creator)
        get_queryset(request)

        MockLayer.objects.filter.assert_called_once()
        call_kwargs = MockLayer.objects.filter.call_args
        self.assertIn('id__in', call_kwargs.kwargs)

    @patch('geosight.cloud_native_gis.patch.Layer')
    def test_unauthenticated_user_sees_public_layers_only(self, MockLayer):
        """Anonymous user query still calls the Layer filter."""
        from geosight.cloud_native_gis.patch import get_queryset

        anon = MagicMock()
        anon.is_authenticated = False
        request = _make_request(anon)

        get_queryset(request)
        MockLayer.objects.filter.assert_called_once()


class GetResourcesPatchTest(TestCase):
    """Tests for the patched get_resources function."""

    def setUp(self):
        """Create users and a ContextLayer linked to a mock cloud-native layer."""
        self.creator = create_user(ROLES.CREATOR.name)
        self.viewer = create_user(ROLES.VIEWER.name)

        self.context_layer = ContextLayer.permissions.create(
            user=self.creator,
            name='CNG Layer',
            url='http://example.com',
            layer_type=LayerType.ARCGIS,
        )
        self.context_layer.permission.organization_permission = PERMISSIONS.NONE
        self.context_layer.permission.save()

        self.mock_layer = _make_layer(layer_id=42)
        self.context_layer.cloud_native_gis_layer_id = self.mock_layer.id
        self.context_layer.save()

    def _call_get_resources(self, user):
        """Run get_resources with mocked DB and pygeoapi config."""
        from geosight.cloud_native_gis.patch import get_resources

        base_config = {
            'server': {},
            'logging': {},
            'metadata': {},
            'resources': {},
        }
        mock_resource = {
            'type': 'collection',
            'title': {'en': ''},
            'description': {'en': ''},
            'providers': [{'editable': True}],
        }
        with patch(
            'geosight.cloud_native_gis.patch.ContextLayer'
        ) as MockCL, patch(
            'geosight.cloud_native_gis.patch.Layer'
        ) as MockLayer, patch(
            'geosight.cloud_native_gis.patch.connection'
        ) as mock_conn, patch(
            'geosight.cloud_native_gis.patch.settings'
        ) as mock_settings, patch(
            'geosight.cloud_native_gis.patch._layer_to_resource',
            return_value=mock_resource,
        ):
            MockCL.permissions.list.return_value = [self.context_layer]
            MockLayer.objects.filter.return_value.order_by.return_value = [
                self.mock_layer
            ]
            mock_conn.settings_dict = {
                'HOST': 'localhost', 'PORT': 5432,
                'NAME': 'db', 'USER': 'u', 'PASSWORD': 'p',
            }
            mock_settings.PYGEOAPI_CONFIG = base_config

            request = _make_request(user)
            return get_resources(request)

    def test_creator_gets_editable_true(self):
        """Resource owner with WRITE permission sees editable=True."""
        self.context_layer.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name
        )
        config = self._call_get_resources(self.creator)
        resource_id = str(self.mock_layer.unique_id)
        provider = config['resources'][resource_id]['providers'][0]
        self.assertTrue(provider['editable'])

    def test_viewer_without_write_gets_editable_false(self):
        """Viewer without write permission sees editable=False."""
        self.context_layer.permission.update_user_permission(
            self.viewer, PERMISSIONS.READ.name
        )
        config = self._call_get_resources(self.viewer)
        resource_id = str(self.mock_layer.unique_id)
        provider = config['resources'][resource_id]['providers'][0]
        self.assertFalse(provider['editable'])

    def test_unauthenticated_user_gets_editable_false(self):
        """Anonymous user always sees editable=False."""
        anon = MagicMock()
        anon.is_authenticated = False
        config = self._call_get_resources(anon)
        resource_id = str(self.mock_layer.unique_id)
        provider = config['resources'][resource_id]['providers'][0]
        self.assertFalse(provider['editable'])

    def test_layer_without_context_layer_not_in_resources(self):
        """A layer not linked to any visible ContextLayer is excluded from resources."""
        from geosight.cloud_native_gis.patch import get_resources

        orphan_layer = _make_layer(layer_id=999)
        base_config = {
            'server': {}, 'logging': {}, 'metadata': {}, 'resources': {}
        }
        mock_resource = {
            'type': 'collection',
            'title': {'en': ''},
            'description': {'en': ''},
            'providers': [{'editable': True}],
        }

        with patch(
            'geosight.cloud_native_gis.patch.ContextLayer'
        ) as MockCL, patch(
            'geosight.cloud_native_gis.patch.Layer'
        ) as MockLayer, patch(
            'geosight.cloud_native_gis.patch.connection'
        ) as mock_conn, patch(
            'geosight.cloud_native_gis.patch.settings'
        ) as mock_settings, patch(
            'geosight.cloud_native_gis.patch._layer_to_resource',
            return_value=mock_resource,
        ):
            MockCL.permissions.list.return_value = []
            MockLayer.objects.filter.return_value.order_by.return_value = [
                orphan_layer
            ]
            mock_conn.settings_dict = {
                'HOST': 'localhost', 'PORT': 5432,
                'NAME': 'db', 'USER': 'u', 'PASSWORD': 'p',
            }
            mock_settings.PYGEOAPI_CONFIG = base_config

            request = _make_request(self.creator)
            config = get_resources(request)

        resource_id = str(orphan_layer.unique_id)
        self.assertNotIn(resource_id, config['resources'])

    def test_resources_dict_structure(self):
        """get_resources returns a deep copy of PYGEOAPI_CONFIG with resources key."""
        config = self._call_get_resources(self.creator)
        self.assertIn('resources', config)
        self.assertIn('server', config)
        resource_id = str(self.mock_layer.unique_id)
        self.assertIn(resource_id, config['resources'])