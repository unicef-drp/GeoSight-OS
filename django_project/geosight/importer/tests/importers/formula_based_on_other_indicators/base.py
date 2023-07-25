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
__date__ = '06/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from geosight.data.tests.model_factories import (
    IndicatorValueF, IndicatorF
)
from geosight.georepo.models.entity import Entity
from geosight.georepo.tests.model_factories import ReferenceLayerF
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, IndicatorDataType, AdminLevelType
)
from geosight.importer.models import Importer, ImportType, InputFormat
from geosight.importer.tests.importers._base import (
    BaseIndicatorValueImporterTest
)

expression_1 = """
{% set x = get_value("TEST_1", "current", null, "now", "sum") %}
{% set y = get_value("TEST_2", "current", null, "now", "sum") %}
{{ x + y }},2020-12-31T00:00:00
"""

expression_2 = """
{% set x = get_value("TEST_1", "current", null, "now", "sum") %}
{% set y = get_value("TEST_2", "current", null, "now", "sum") %}
{{ x * y }},2020-12-31T00:00:00
"""

expression_3 = """
{% set x = get_value("TEST_1", "current", null, "2020-01-01T00:00:00", "sum")%}
{% set y = get_value("TEST_2", "current", null, "2020-01-01T00:00:00", "sum")%}
{{ x + y }},2020-12-31T00:00:00
"""

expression_4 = """
{% set x = get_value("TEST_1", "current", null, "now", "avg") %}
{% set y = get_value("TEST_2", "current", null, "now", "avg") %}
{{ x + y }},2020-12-31T00:00:00
"""


class BaseTest(BaseIndicatorValueImporterTest):
    """Base for Api Importer."""

    attributes = {
        'indicator_data_type': IndicatorDataType.BY_VALUE,
        'date_time_data_type': ImporterTimeDataType.DATA_DRIVEN,
        'date_time_data_field': 'time',
        'date_time_data_format': '%Y-%m-%dT%H:%M:%S',
        'admin_level_type': AdminLevelType.BY_VALUE,
        'admin_level_value': 0,
        'key_administration_code': 'geom_code',
        'key_value': 'value',
    }

    def setUp(self):
        """To setup tests."""
        super().setUp()
        self.admin_level = 0
        self.reference_layer = ReferenceLayerF()
        self.attributes['indicator_data_value'] = self.indicator.id
        self.attributes['admin_level_value'] = self.admin_level
        self.importer = Importer.objects.create(
            import_type=ImportType.INDICATOR_VALUE,
            input_format=InputFormat.FORMULA_BASED_ON_OTHER_INDICATORS,
            reference_layer=self.reference_layer
        )
        self.reference_layer_identifier = self.reference_layer.identifier

        # Prepare entities
        self.entity_1 = Entity.objects.create(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level,
            geom_id='Geom_1',
            concept_uuid='Concept Id 1',
        )
        self.entity_2 = Entity.objects.create(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level,
            geom_id='Geom_2',
            concept_uuid='Concept Id 2',
        )

        # Prepare data
        self.indicator_1 = IndicatorF(name='test', shortcode='TEST_1')
        self.indicator_2 = IndicatorF(name='test', shortcode='TEST_2')

        # Create indicator value
        # 2020-01-01
        IndicatorValueF(
            indicator=self.indicator_1,
            geom_id=self.entity_1.geom_id,
            date='2020-01-01',
            value=10
        )
        IndicatorValueF(
            indicator=self.indicator_2,
            geom_id=self.entity_1.geom_id,
            date='2020-01-01',
            value=20
        )
        IndicatorValueF(
            indicator=self.indicator_1,
            geom_id=self.entity_2.geom_id,
            date='2020-01-01',
            value=5
        )
        IndicatorValueF(
            indicator=self.indicator_2,
            geom_id=self.entity_2.geom_id,
            date='2020-01-01',
            value=5
        )

        # 2020-02-01
        IndicatorValueF(
            indicator=self.indicator_1,
            geom_id=self.entity_1.geom_id,
            date='2020-02-01',
            value=20
        )
        IndicatorValueF(
            indicator=self.indicator_2,
            geom_id=self.entity_1.geom_id,
            date='2020-02-01',
            value=100
        )
        IndicatorValueF(
            indicator=self.indicator_1,
            geom_id=self.entity_2.geom_id,
            date='2020-02-01',
            value=20
        )
        IndicatorValueF(
            indicator=self.indicator_2,
            geom_id=self.entity_2.geom_id,
            date='2020-02-01',
            value=10
        )
        self.indicators = f'{[self.indicator_1.id, self.indicator_2.id]}'

        self.values_expression_1 = {
            'Geom_1': {
                '2020-12-31': 150
            },
            'Geom_2': {
                '2020-12-31': 40
            }
        }

        self.values_expression_2 = {
            'Geom_1': {
                '2020-12-31': 3600
            },
            'Geom_2': {
                '2020-12-31': 375
            }
        }

        self.values_expression_3 = {
            'Geom_1': {
                '2020-12-31': 30
            },
            'Geom_2': {
                '2020-12-31': 10
            }
        }

        self.values_expression_4 = {
            'Geom_1': {
                '2020-12-31': 75
            },
            'Geom_2': {
                '2020-12-31': 20
            }
        }
