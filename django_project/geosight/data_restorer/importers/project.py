# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '14/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

import os

from django.core.files import File

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.dashboard.dashboard import Dashboard, DashboardGroup
from geosight.data.models.dashboard.dashboard_cache_permissions import (
    DashboardCachePermissions
)
from geosight.data.models.dashboard.dashboard_indicator_layer import (
    DashboardIndicatorLayer, DashboardIndicatorLayerIndicator
)
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardIndicator, DashboardBasemap
)
from geosight.data.models.dashboard.dashboard_widget import DashboardWidget
from geosight.data.models.indicator.indicator import Indicator
from geosight.data_restorer.importers.base import BaseImporter
from geosight.georepo.models.reference_layer import ReferenceLayerView


class ProjectImporter(BaseImporter):
    """Import a project (dashboard) from a JSON file as new records."""

    def run(self):
        """
        Import all records from the project fixture file as new objects.

        :return: The newly created ``Dashboard`` instance.
        :rtype: geosight.data.models.dashboard.dashboard.Dashboard
        :raises ValueError: If no ``geosight_data.dashboard`` record is found
            in the fixture.
        """
        by_model = self._load()

        # -----------------------------------------------------------------
        # 1. Dashboard (exactly one expected)
        # -----------------------------------------------------------------
        dashboard_records = by_model.get('geosight_data.dashboard', [])
        if not dashboard_records:
            raise ValueError('No geosight_data.dashboard record found.')

        dash_fields = dashboard_records[0]['fields']
        creator = self._get_user(dash_fields['creator'])
        group, _ = DashboardGroup.objects.get_or_create(name='Sample')

        reference_layer = ReferenceLayerView.objects.get(
            identifier=dash_fields['dataset_identifier']
        )

        dashboard = Dashboard(
            name=dash_fields['name'],
            description=dash_fields['description'],
            overview=dash_fields['overview'],
            reference_layer=reference_layer,
            extent=dash_fields['extent'],
            min_zoom=dash_fields['min_zoom'],
            max_zoom=dash_fields['max_zoom'],
            geo_field=dash_fields['geo_field'],
            level_config=dash_fields['level_config'],
            filters=dash_fields['filters'],
            filters_allow_modify=dash_fields['filters_allow_modify'],
            filters_being_hidden=dash_fields['filters_being_hidden'],
            show_splash_first_open=dash_fields['show_splash_first_open'],
            truncate_indicator_layer_name=dash_fields[
                'truncate_indicator_layer_name'
            ],
            default_time_mode=dash_fields['default_time_mode'],
            show_map_toolbar=dash_fields['show_map_toolbar'],
            featured=dash_fields['featured'],
            auto_zoom_to_filter=dash_fields['auto_zoom_to_filter'],
            group=group,
            creator=creator,
            modified_by=creator,
        )
        dashboard.save()

        # -----------------------------------------------------------------
        # 2. DashboardIndicator
        # -----------------------------------------------------------------
        for record in by_model.get('geosight_data.dashboardindicator', []):
            f = record['fields']
            indicator = Indicator.objects.get(
                shortcode=f['indicator_shortcode']
            )
            DashboardIndicator.objects.create(
                dashboard=dashboard,
                object=indicator,
                order=f['order'],
                visible_by_default=f['visible_by_default'],
                override_style=f['override_style'],
                override_label=f['override_label'],
            )

        # -----------------------------------------------------------------
        # 3. DashboardIndicatorLayer  (keep list for step 4 FK resolution)
        # -----------------------------------------------------------------
        layers = []
        for record in by_model.get(
                'geosight_data.dashboardindicatorlayer', []
        ):
            f = record['fields']
            layer = DashboardIndicatorLayer.objects.create(
                dashboard=dashboard,
                order=f['order'],
                visible_by_default=f['visible_by_default'],
                name=f['name'],
                description=f['description'],
                level_config=f['level_config'],
                type=f['type'],
                popup_type=f['popup_type'],
                popup_template=f['popup_template'],
                override_style=f['override_style'],
                override_label=f['override_label'],
                multi_indicator_mode=f['multi_indicator_mode'],
                chart_style=f['chart_style'],
                raw_data_popup_enable=f['raw_data_popup_enable'],
                raw_data_popup_config=f['raw_data_popup_config'],
                style_type=f['style_type'],
                style_config=f['style_config'],
                label_config=f['label_config'],
            )
            layers.append(layer)

        dashboard.indicator_layers_structure = {
            "id": "00000000-0000-0000-0000-000000000000",
            "group": "",
            "children": [layer.id for layer in layers]
        }

        # -----------------------------------------------------------------
        # 4. DashboardIndicatorLayerIndicator
        # -----------------------------------------------------------------
        layer_indicator_records = by_model.get(
            'geosight_data.dashboardindicatorlayerindicator', []
        )
        for i, record in enumerate(layer_indicator_records):
            f = record['fields']
            layer = layers[i] if i < len(layers) else layers[
                0] if layers else None
            indicator = Indicator.objects.get(
                shortcode=f['indicator_shortcode']
            )
            DashboardIndicatorLayerIndicator.objects.create(
                object=layer,
                indicator=indicator,
                order=f['order'],
                name=f['name'],
                color=f['color'],
                override_style=f['override_style'],
                style_type=f['style_type'],
                style_config=f['style_config'],
                label_config=f['label_config'],
            )

        # -----------------------------------------------------------------
        # 5. DashboardBasemap
        # -----------------------------------------------------------------
        basemaps = []
        for record in by_model.get('geosight_data.dashboardbasemap', []):
            f = record['fields']
            basemap = BasemapLayer.objects.get(pk=f['object'])
            layer = DashboardBasemap.objects.create(
                dashboard=dashboard,
                object=basemap,
                order=f['order'],
                visible_by_default=f['visible_by_default'],
            )
            basemaps.append(layer)

        dashboard.basemaps_layers_structure = {
            "id": "00000000-0000-0000-0000-000000000000",
            "group": "",
            "children": [layer.id for layer in basemaps]
        }

        # -----------------------------------------------------------------
        # 6. DashboardWidget
        # -----------------------------------------------------------------
        widgets = []
        for record in by_model.get('geosight_data.dashboardwidget', []):
            f = record['fields']
            for conf in f['config']['indicators']:
                indicator = Indicator.objects.get(
                    shortcode=conf['indicator_shortcode']
                )
                conf['id'] = indicator.id
                conf['name'] = indicator.name

            layer = DashboardWidget.objects.create(
                dashboard=dashboard,
                name=f['name'],
                description=f['description'],
                order=f['order'],
                visible_by_default=f['visible_by_default'],
                type=f['type'],
                config=f['config'],
            )
            widgets.append(layer)

        dashboard.widgets_structure = {
            "id": "00000000-0000-0000-0000-000000000000",
            "group": "",
            "children": [layer.id for layer in widgets]
        }
        dashboard.save()

        icon_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'demo_data', 'countries_data', 'icon.png'
        )
        if os.path.isfile(icon_path):
            with open(icon_path, 'rb') as f:
                dashboard.icon.save('icon.png', File(f), save=True)

        dashboard.update_cache(None)
        cache_permission, _ = DashboardCachePermissions.objects.get_or_create(
            dashboard=dashboard, user=creator
        )
        cache_permission.generate_cache()
        return dashboard
