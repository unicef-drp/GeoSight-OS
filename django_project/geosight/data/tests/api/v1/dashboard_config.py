# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__date__ = '24/11/2026'
__copyright__ = ('Copyright 2026, Unicef')

import copy
import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse

from geosight.data.models.dashboard import (
    Dashboard, DashboardBookmark, DashboardIndicatorLayer, DashboardWidget
)
from geosight.data.models.dashboard.dashboard_embed import DashboardEmbed
from geosight.data.tests.model_factories import (
    BasemapLayerF, ContextLayerF, IndicatorF
)
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request.request import GeorepoRequestError
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardConfigUpdateApiTest(BasePermissionTest.TestCase):
    """Tests for dashboard create, config and update through API v1."""

    def create_resource(self, user):
        """Create resource function."""
        return None

    def get_resources(self, user):
        """Create resource function."""
        return None

    def setUp(self):
        """To setup test."""
        super().setUp()
        ReferenceLayerView.objects.get_or_create(
            identifier='AAAA', name='AAAA'
        )
        self.indicator_a = IndicatorF(name='Indicator A')
        self.indicator_b = IndicatorF(name='Indicator B')
        self.basemap = BasemapLayerF(name='OSM')
        self.context_layer = ContextLayerF(name='Health sites')

        response = self.assertRequestPostView(
            reverse('dashboards-list'), 201,
            json.dumps(self.full_payload('config-dashboard')),
            user=self.creator, content_type=self.JSON_CONTENT
        )
        self.assertEqual(response.json()['slug'], 'config-dashboard')
        self.dashboard = Dashboard.objects.get(slug='config-dashboard')

    def full_payload(self, slug):
        """Return a payload with an indicator layer, widget and filter."""
        return {
            'name': 'Config dashboard',
            'slug': slug,
            'group': 'API',
            'description': 'Original description',
            'overview': 'Original overview',
            'data': {
                'reference_layer': 'AAAA',
                'extent': [0, 0, 10, 10],
                'level_config': {'levels': [0, 1], 'default_level': 1},
                'default_time_mode': {'use_only_last_known_value': True},
                'truncate_indicator_layer_name': True,
                'indicators': [{'id': self.indicator_a.id}],
                'indicator_layers': [
                    {
                        'id': 1, 'name': 'Layer A',
                        'visible_by_default': True,
                        'indicators': [{'id': self.indicator_a.id}]
                    },
                    {
                        'id': 2, 'name': 'Layer B',
                        'indicators': [{'id': self.indicator_b.id}]
                    }
                ],
                'basemaps_layers': [
                    {'id': self.basemap.id, 'visible_by_default': True}
                ],
                'context_layers': [
                    {'id': self.context_layer.id, 'visible_by_default': True}
                ],
                'widgets': [
                    {
                        'id': 1, 'name': 'Total of A',
                        'type': 'SummaryWidget',
                        'config': {'layer_id': 1, 'operation': 'Sum'}
                    },
                    {
                        'id': 2, 'name': 'Second widget',
                        'type': 'SummaryWidget',
                        'config': {'layer_id': 2, 'operation': 'Sum'}
                    }
                ],
                'filters': {
                    'type': 'GROUP', 'operator': 'AND',
                    'queries': [{
                        'name': 'A above 50', 'type': 'EXPRESSION',
                        'field': f'indicator_{self.indicator_a.id}.value',
                        'operator': '>', 'value': '50', 'active': True
                    }]
                },
            }
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def config_url(self, slug=None):
        """Return the config URL."""
        return reverse(
            'dashboards-config', args=[slug or self.dashboard.slug]
        )

    def detail_url(self, slug=None):
        """Return the detail URL."""
        return reverse(
            'dashboards-detail', args=[slug or self.dashboard.slug]
        )

    def get_config(self, user=None):
        """Return the config as the creator (owner)."""
        return self.assertRequestGetView(
            self.config_url(), 200, user=user or self.creator
        ).json()

    def put(self, payload, code, user=None):
        """Send a PUT request."""
        return self.assertRequestPutView(
            self.detail_url(), code, json.dumps(payload),
            user=user or self.creator
        )

    def post(self, payload, code, user=None):
        """Send a POST request."""
        return self.assertRequestPostView(
            reverse('dashboards-list'), code, json.dumps(payload),
            user=user or self.creator, content_type=self.JSON_CONTENT
        )

    def error_fields(self, response):
        """Return the error field paths of a 400 response."""
        return [error['field'] for error in response.json()['errors']]

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------
    def test_create_full_payload(self):
        """The full payload creates layers, widgets, filters and settings."""
        dashboard = self.dashboard
        self.assertEqual(dashboard.creator, self.creator)
        self.assertEqual(dashboard.description, 'Original description')
        self.assertEqual(
            dashboard.dashboardindicatorlayer_set.count(), 2
        )
        self.assertEqual(dashboard.dashboardwidget_set.count(), 2)
        self.assertEqual(dashboard.dashboardbasemap_set.count(), 1)
        self.assertEqual(dashboard.dashboardcontextlayer_set.count(), 1)
        self.assertIn('A above 50', dashboard.filters)
        # Settings sent inside data are applied
        self.assertTrue(dashboard.truncate_indicator_layer_name)
        self.assertEqual(
            dashboard.default_time_mode, {'use_only_last_known_value': True}
        )
        # Layer names and colours default from the indicator
        layer = dashboard.dashboardindicatorlayer_set.get(name='Layer A')
        layer_indicator = layer.dashboardindicatorlayerindicator_set.first()
        self.assertEqual(layer_indicator.name, 'Indicator A')
        # Widget config points to the saved layer id
        widget = dashboard.dashboardwidget_set.get(name='Total of A')
        self.assertEqual(widget.config['layer_id'], layer.id)

    def test_create_minimal_payload(self):
        """Only reference_layer and extent are needed."""
        self.post({
            'name': 'Minimal', 'slug': 'minimal-dashboard',
            'data': {'reference_layer': 'AAAA', 'extent': [0, 0, 1, 1]}
        }, 201)
        dashboard = Dashboard.objects.get(slug='minimal-dashboard')
        self.assertEqual(dashboard.dashboardindicatorlayer_set.count(), 0)
        self.assertEqual(dashboard.creator, self.creator)

    def test_create_reports_field_errors(self):
        """Missing and wrong keys are reported with their path."""
        response = self.post({
            'name': 'Broken', 'slug': 'broken-dashboard',
            'data': {'indicators': 'not a list'}
        }, 400)
        fields = self.error_fields(response)
        self.assertIn('data.extent', fields)
        self.assertIn('data.reference_layer', fields)
        self.assertIn('data.indicators', fields)
        self.assertIn('data.extent', response.json()['detail'])
        self.assertFalse(
            Dashboard.objects.filter(slug='broken-dashboard').exists()
        )

    def test_create_unknown_indicator_in_layer(self):
        """An unknown indicator inside a layer is an error, not skipped."""
        payload = self.full_payload('unknown-indicator')
        payload['data']['indicator_layers'][0]['indicators'][0]['id'] = (
            999999
        )
        response = self.post(payload, 400)
        self.assertIn(
            'data.indicator_layers[0].indicators[0].id',
            self.error_fields(response)
        )
        self.assertFalse(
            Dashboard.objects.filter(slug='unknown-indicator').exists()
        )

    def test_create_unknown_objects(self):
        """Unknown basemaps, context layers and indicators are reported."""
        payload = self.full_payload('unknown-objects')
        payload['data']['basemaps_layers'][0]['id'] = 999999
        payload['data']['context_layers'][0]['id'] = 999998
        payload['data']['indicators'][0]['id'] = 999997
        response = self.post(payload, 400)
        fields = self.error_fields(response)
        self.assertIn('data.basemaps_layers[0].id', fields)
        self.assertIn('data.context_layers[0].id', fields)
        self.assertIn('data.indicators[0].id', fields)

    def test_create_missing_rule_keys(self):
        """A style rule without the needed keys is reported."""
        payload = self.full_payload('missing-rule-keys')
        payload['data']['indicator_layers'][0]['style'] = [
            {'name': 'High', 'rule': 'x>50'}
        ]
        response = self.post(payload, 400)
        self.assertIn(
            'data.indicator_layers[0].style[0].color',
            self.error_fields(response)
        )

    def test_create_accepts_editor_layer_styles(self):
        """Layer styles the editor sends (null, chart style) are accepted."""
        payload = self.full_payload('editor-layer-styles')
        payload['data']['indicator_layers'][0]['style'] = None
        payload['data']['indicator_layers'][1].update({
            'type': 'Multi Indicator',
            'style': {'sizeType': 'Fixed size', 'chartType': 'Pie', 'size': 50},
            'indicators': [
                {'id': self.indicator_a.id, 'style': None},
                {'id': self.indicator_b.id, 'style': None}
            ]
        })
        self.post(payload, 201)
        dashboard = Dashboard.objects.get(slug='editor-layer-styles')
        self.assertEqual(
            dashboard.dashboardindicatorlayer_set.count(), 2
        )

    @patch('geosight.georepo.tasks.fetch_reference_codes.delay')
    @patch('geosight.georepo.tasks.create_data_access_reference_layer_view.delay')
    def test_create_unknown_reference_layer(self, *args):
        """An unknown reference layer is a 400 and leaves no new row."""
        count = ReferenceLayerView.objects.count()
        payload = self.full_payload('unknown-reference-layer')
        payload['data']['reference_layer'] = 'does-not-exist'
        with patch.object(
                ReferenceLayerView, 'update_meta',
                side_effect=GeorepoRequestError('Not found')
        ):
            response = self.post(payload, 400)
        self.assertIn('data.reference_layer', self.error_fields(response))
        self.assertEqual(ReferenceLayerView.objects.count(), count)
        self.assertFalse(
            Dashboard.objects.filter(slug='unknown-reference-layer').exists()
        )

    def test_create_from_config(self):
        """The config of one dashboard creates a copy under a new slug."""
        config = self.get_config()
        config['slug'] = 'config-copy'
        config['name'] = 'Config copy'
        self.post(config, 201)
        copy_config = self.assertRequestGetView(
            self.config_url('config-copy'), 200, user=self.creator
        ).json()
        self.assertEqual(
            [layer['name'] for layer in copy_config['data'][
                'indicator_layers']],
            [layer['name'] for layer in config['data']['indicator_layers']]
        )
        self.assertEqual(
            copy_config['data']['filters'], config['data']['filters']
        )
        self.assertEqual(
            copy_config['default_time_mode'], config['default_time_mode']
        )

    # ------------------------------------------------------------------
    # Config
    # ------------------------------------------------------------------
    def test_config_permissions(self):
        """Config needs read permission on the dashboard."""
        self.assertRequestGetView(self.config_url(), 403)
        self.assertRequestGetView(self.config_url(), 403, user=self.viewer)
        self.dashboard.permission.update_user_permission(
            self.viewer, PERMISSIONS.READ
        )
        self.assertRequestGetView(self.config_url(), 200, user=self.viewer)
        self.assertRequestGetView(
            self.config_url('not-a-dashboard'), 404, user=self.admin
        )

    def test_config_shape(self):
        """Config has the create/update shape and no sharing."""
        config = self.get_config()
        for key in ['name', 'slug', 'description', 'overview', 'group',
                    'geoField', 'default_time_mode', 'modified_at', 'data']:
            self.assertIn(key, config)
        data = config['data']
        self.assertEqual(data['reference_layer'], 'AAAA')
        self.assertEqual(data['extent'], [0, 0, 10, 10])
        self.assertNotIn('permission', data)
        self.assertNotIn('permission', config)
        self.assertEqual(len(data['indicator_layers']), 2)
        self.assertEqual(data['filters']['queries'][0]['name'], 'A above 50')

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------
    def test_update_permissions(self):
        """Update needs contributor role and edit permission."""
        payload = {'description': 'Changed'}
        self.assertRequestPutView(
            self.detail_url(), 403, json.dumps(payload)
        )
        self.dashboard.permission.update_user_permission(
            self.viewer, PERMISSIONS.WRITE
        )
        self.put(payload, 403, user=self.viewer)
        self.put(payload, 403, user=self.contributor)
        self.dashboard.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ
        )
        self.put(payload, 403, user=self.contributor)
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.description, 'Original description')

        self.dashboard.permission.update_user_permission(
            self.contributor, PERMISSIONS.WRITE
        )
        self.put(payload, 200, user=self.contributor)
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.description, 'Changed')
        self.assertEqual(self.dashboard.modified_by, self.contributor)

    def test_update_is_in_place(self):
        """The dashboard row, creator and creation date stay."""
        before = Dashboard.objects.get(id=self.dashboard.id)
        response = self.put({'name': 'Renamed dashboard'}, 200)
        after = Dashboard.objects.get(id=self.dashboard.id)
        self.assertEqual(after.name, 'Renamed dashboard')
        self.assertEqual(after.created_at, before.created_at)
        self.assertEqual(after.creator, before.creator)
        self.assertNotEqual(after.modified_at, before.modified_at)
        self.assertNotEqual(after.version_data, before.version_data)
        self.assertEqual(Dashboard.objects.count(), 1)
        self.assertEqual(
            response.json()['modified_at'], after.modified_at.isoformat()
        )

    def test_update_keeps_what_is_not_sent(self):
        """Settings and data keys that are not sent keep their value."""
        layer_ids = list(
            self.dashboard.dashboardindicatorlayer_set.values_list(
                'id', flat=True
            ).order_by('id')
        )
        self.put({'description': 'Only this changes'}, 200)
        dashboard = Dashboard.objects.get(id=self.dashboard.id)
        self.assertEqual(dashboard.description, 'Only this changes')
        self.assertEqual(dashboard.overview, 'Original overview')
        self.assertEqual(dashboard.group.name, 'API')
        self.assertTrue(dashboard.truncate_indicator_layer_name)
        self.assertEqual(
            dashboard.default_time_mode, {'use_only_last_known_value': True}
        )
        self.assertIn('A above 50', dashboard.filters)
        self.assertEqual(
            list(dashboard.dashboardindicatorlayer_set.values_list(
                'id', flat=True
            ).order_by('id')),
            layer_ids
        )
        self.assertEqual(dashboard.dashboardwidget_set.count(), 2)
        self.assertEqual(dashboard.dashboardcontextlayer_set.count(), 1)

    def test_update_unchanged_config(self):
        """Sending the config back unchanged keeps everything."""
        config = self.get_config()
        self.put(config, 200)
        after = self.get_config()
        config.pop('modified_at')
        after.pop('modified_at')
        self.assertEqual(
            [(layer['id'], layer['name']) for layer in after['data'][
                'indicator_layers']],
            [(layer['id'], layer['name']) for layer in config['data'][
                'indicator_layers']]
        )
        self.assertEqual(
            [(widget['id'], widget['name']) for widget in after['data'][
                'widgets']],
            [(widget['id'], widget['name']) for widget in config['data'][
                'widgets']]
        )
        self.assertEqual(after['description'], config['description'])
        self.assertEqual(after['data']['filters'], config['data']['filters'])

    def test_update_replaces_lists(self):
        """A list that is sent replaces the current one, keeping ids."""
        layer_a = self.dashboard.dashboardindicatorlayer_set.get(
            name='Layer A'
        )
        config = self.get_config()
        layers = config['data']['indicator_layers']
        kept = [layer for layer in layers if layer['id'] == layer_a.id][0]
        kept['name'] = 'Layer A renamed'
        new_layer = {
            'id': 999999, 'name': 'Layer new',
            'indicators': [{'id': self.indicator_b.id}]
        }
        widgets = [
            widget for widget in config['data']['widgets']
            if widget['name'] == 'Total of A'
        ]
        self.put({
            'data': {
                'indicator_layers': [kept, new_layer],
                'widgets': widgets
            }
        }, 200)
        layers = DashboardIndicatorLayer.objects.filter(
            dashboard=self.dashboard
        )
        self.assertEqual(layers.count(), 2)
        self.assertEqual(layers.get(id=kept['id']).name, 'Layer A renamed')
        self.assertTrue(layers.filter(name='Layer new').exists())
        self.assertFalse(layers.filter(name='Layer B').exists())
        self.assertEqual(
            list(DashboardWidget.objects.filter(
                dashboard=self.dashboard
            ).values_list('id', flat=True)),
            [widgets[0]['id']]
        )

    def test_update_keeps_bookmarks_and_embeds(self):
        """Bookmarks and embeds stay, with valid layer ids."""
        layer = self.dashboard.dashboardindicatorlayer_set.get(
            name='Layer A'
        )
        bookmark = DashboardBookmark.objects.create(
            dashboard=self.dashboard, creator=self.creator, name='Mine',
            selected_indicator_layers=[layer.id]
        )
        embed = DashboardEmbed.objects.create(
            dashboard=self.dashboard, code='embed-code',
            selected_indicator_layers=[layer.id]
        )
        config = self.get_config()
        for item in config['data']['indicator_layers']:
            item['name'] = f"Layer {item['id']} (updated)"
        self.put(config, 200)

        bookmark.refresh_from_db()
        embed.refresh_from_db()
        layer.refresh_from_db()
        self.assertEqual(layer.name, f'Layer {layer.id} (updated)')
        self.assertEqual(bookmark.selected_indicator_layers, [layer.id])
        self.assertEqual(embed.selected_indicator_layers, [layer.id])
        self.assertEqual(bookmark.dashboard, self.dashboard)

    def test_update_sharing(self):
        """Sharing stays unless sent, and sending it needs share."""
        self.dashboard.permission.update_user_permission(
            self.contributor, PERMISSIONS.WRITE
        )
        public_before = self.dashboard.permission.public_permission

        # Not sent: unchanged
        self.put({'description': 'No sharing change'}, 200,
                 user=self.contributor)
        self.dashboard.permission.refresh_from_db()
        self.assertEqual(
            self.dashboard.permission.public_permission, public_before
        )

        # Sent without share permission: 403 and nothing saved
        permission = {
            'organization_permission': PERMISSIONS.READ.name,
            'public_permission': PERMISSIONS.READ.name,
            'user_permissions': [
                {'id': self.contributor.id,
                 'permission': PERMISSIONS.OWNER.name}
            ],
            'group_permissions': []
        }
        self.put({
            'description': 'With sharing',
            'data': {'permission': permission}
        }, 403, user=self.contributor)
        self.dashboard.refresh_from_db()
        self.dashboard.permission.refresh_from_db()
        self.assertEqual(self.dashboard.description, 'No sharing change')
        self.assertEqual(
            self.dashboard.permission.public_permission, public_before
        )
        self.assertFalse(
            self.dashboard.permission.has_share_perm(self.contributor)
        )

        # Sent by the owner: applied
        self.put({'data': {'permission': permission}}, 200)
        self.dashboard.permission.refresh_from_db()
        self.assertEqual(
            self.dashboard.permission.public_permission,
            PERMISSIONS.READ.name
        )

    def test_update_rolls_back(self):
        """A failure while saving relations saves nothing."""
        with patch.object(
                Dashboard, 'save_relations',
                side_effect=RuntimeError('save relations failure')
        ):
            response = self.put({'description': 'Should not stay'}, 400)
        self.assertIn('detail', response.json())
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.description, 'Original description')

    def test_update_invalid_payload(self):
        """An invalid update is a 400 with paths and changes nothing."""
        response = self.put({
            'description': 'Should not stay',
            'data': {'indicators': [{'id': 999999}]}
        }, 400)
        self.assertIn('data.indicators[0].id', self.error_fields(response))
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.description, 'Original description')

    def test_update_modified_at(self):
        """A stale modified_at is a 409; the current one is accepted."""
        config = self.get_config()
        self.put({'modified_at': config['modified_at'], 'name': 'First'}, 200)
        response = self.put(
            {'modified_at': config['modified_at'], 'name': 'Second'}, 409
        )
        self.assertIn('detail', response.json())
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.name, 'First')
        self.put({'modified_at': 'yesterday', 'name': 'Third'}, 400)

    def test_update_featured(self):
        """Only admins change featured; sending the current value is ok."""
        self.put({'featured': False, 'name': 'Still fine'}, 200)
        self.put({'featured': True}, 400)
        self.dashboard.refresh_from_db()
        self.assertFalse(self.dashboard.featured)
        self.put({'featured': True}, 200, user=self.admin)
        self.dashboard.refresh_from_db()
        self.assertTrue(self.dashboard.featured)
        # A creator sending the config back does not unset featured
        self.put(self.get_config(), 200)
        self.put({'featured': False}, 400)
        self.dashboard.refresh_from_db()
        self.assertTrue(self.dashboard.featured)

    def test_update_slug(self):
        """The slug can change, but not to one that is used."""
        self.post({
            'name': 'Other', 'slug': 'other-dashboard',
            'data': {'reference_layer': 'AAAA', 'extent': [0, 0, 1, 1]}
        }, 201)
        self.put({'slug': 'other-dashboard'}, 400)
        self.put({'slug': 'new-slug'}, 200)
        self.dashboard.refresh_from_db()
        self.assertEqual(self.dashboard.slug, 'new-slug')

    def test_patch_is_not_allowed(self):
        """Only full updates (PUT) are supported."""
        self.assertRequestPatchView(
            self.detail_url(), 405, json.dumps({'name': 'x'}),
            user=self.creator
        )

    def test_update_payload_is_not_mutated_for_other_dashboards(self):
        """Updating one dashboard does not touch another one."""
        payload = copy.deepcopy(self.full_payload('second-dashboard'))
        self.post(payload, 201)
        self.put({'description': 'Only the first'}, 200)
        other = Dashboard.objects.get(slug='second-dashboard')
        self.assertEqual(other.description, 'Original description')
