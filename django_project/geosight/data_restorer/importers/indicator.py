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

from django.db.models import Model

from geosight.data.models.indicator.indicator import Indicator, IndicatorGroup
from geosight.data.models.indicator.indicator_rule import IndicatorRule
from geosight.data.models.indicator.indicator_value import IndicatorValue
from geosight.data_restorer.importers.base import BaseImporter
from geosight.georepo.models.reference_layer import (
    ReferenceLayerIndicator, ReferenceLayerView
)


class IndicatorImporter(BaseImporter):
    """Import indicator from a JSON file as new records (no pk reuse)."""

    def run(self):
        """
        Import all records from the indicator file as new objects.

        Returns the newly created Indicator instance.
        """
        by_model = self._load()

        # -----------------------------------------------------------------
        # 1. Indicator (exactly one expected)
        # -----------------------------------------------------------------
        indicator_records = by_model.get('geosight_data.indicator', [])
        if not indicator_records:
            raise ValueError('No geosight_data.indicator record found.')

        ind = indicator_records[0]['fields']

        if Indicator.objects.filter(shortcode=ind['shortcode']).exists():
            raise ValueError(
                f'Indicator with shortcode "{ind["shortcode"]}" already exists.'
            )

        creator = self._get_user(ind['creator'])
        group, _ = IndicatorGroup.objects.get_or_create(name='Sample')
        indicator = Indicator(
            name=ind['name'],
            description=ind['description'],
            shortcode=ind['shortcode'],
            group=group,
            style_type=ind['style_type'],
            style_config=ind['style_config'],
            label_config=ind['label_config'],
            aggregation_multiple_values=ind['aggregation_multiple_values'],
            aggregation_upper_level_allowed=ind[
                'aggregation_upper_level_allowed'
            ],
            aggregation_upper_level=ind['aggregation_upper_level'],
            type=ind['type'],
            min_value=ind['min_value'],
            max_value=ind['max_value'],
            creator=creator,
            modified_by=creator,
        )
        Model.save(indicator)

        # Create data access entries synchronously (skip Celery)
        for reference_layer in ReferenceLayerView.objects.all():
            ReferenceLayerIndicator.objects.get_or_create(
                reference_layer=reference_layer,
                indicator=indicator
            )

        # -----------------------------------------------------------------
        # 2. IndicatorRule
        # -----------------------------------------------------------------
        for rule_record in by_model.get('geosight_data.indicatorrule', []):
            rule = rule_record['fields']
            IndicatorRule.objects.create(
                indicator=indicator,
                name=rule['name'],
                rule=rule['rule'],
                color=rule['color'],
                outline_color=rule['outline_color'],
                outline_size=rule['outline_size'],
                order=rule['order'],
                active=rule['active'],
            )

        # -----------------------------------------------------------------
        # 3. IndicatorValue
        # -----------------------------------------------------------------
        values = []
        for value_record in by_model.get('geosight_data.indicatorvalue', []):
            value = value_record['fields']
            values.append(
                IndicatorValue(
                    indicator=indicator,
                    date=value['date'],
                    value=value['value'],
                    geom_id=value['geom_id'],
                )
            )
        created = IndicatorValue.objects.bulk_create(values)
        IndicatorValue.assign_flat_table_selected(
            [obj.id for obj in created]
        )
        return indicator
