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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import os

import responses

from core.settings.utils import ABS_PATH
from geosight.data.tests.model_factories import ContextLayerF
from geosight.georepo.models.entity import Entity
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, IndicatorDataType, AdminLevelType
)
from geosight.importer.importers.query_data import Aggregations
from geosight.importer.importers.vector_context_layer.base import SpatialMethod
from geosight.importer.models import Importer, ImportType, InputFormat
from geosight.importer.tests.importers._base import (
    BaseIndicatorValueImporterTest
)


class BaseTest(BaseIndicatorValueImporterTest):
    """Base for Api Importer."""

    databases = {'default', 'temp'}

    arcgis_test_url = 'http://arcgis_test.com'
    attributes = {
        'indicator_data_type': IndicatorDataType.BY_VALUE,
        'date_time_data_type': ImporterTimeDataType.BY_VALUE,
        'date_time_data_value': '2010-01-01',
        'admin_level_type': AdminLevelType.BY_VALUE,
        'geometry_type': 'Point',
        'spatial_operator': SpatialMethod.INTERSECT,
        'aggregation': Aggregations.COUNT,
        'key_administration_code': 'ucode',
        'key_value': 'value',
    }
    responses_folder = ABS_PATH(
        'geosight', 'importer', 'tests', 'importers',
        'vector_context_layer', 'responses'
    )

    def setUp(self):
        """To setup tests."""
        self.context_layer = ContextLayerF(
            name='Test', url=self.arcgis_test_url
        )
        super().setUp()
        self.attributes['context_layer_id'] = self.context_layer.id
        self.attributes['indicator_data_value'] = self.indicator.id
        self.attributes['admin_level_value'] = self.admin_level
        self.importer = Importer.objects.create(
            import_type=ImportType.INDICATOR_VALUE,
            input_format=InputFormat.VECTOR_CONTEXT_LAYER,
            reference_layer=self.reference_layer
        )
        self.reference_layer_identifier = self.reference_layer.identifier

    def mock_request(self, url, response_file):
        """Mock response with file."""
        responses.add(
            responses.GET,
            url,
            status=200,
            json=json.loads(open(response_file, "r").read())
        )

    def mock_requests(self):
        """Mock requests."""
        # Reference Layer
        self.mock_request(
            (
                f'{self.georepo_url}/search/view/'
                f'{self.reference_layer_identifier}/?'
                f'cached=False'
            ),
            os.path.join(self.responses_folder, 'georepo_ref_detail.json')
        )
        # Reference Layer List
        self.mock_request(
            (
                f'{self.georepo_url}/search/view/test/top'
                f'?page=1&page_size=50'
            ),
            os.path.join(self.responses_folder, 'georepo_entity_list.json')
        )
        # Reference Layer BBOX
        self.mock_request(
            (
                f'{self.georepo_url}/operation/view/'
                f'{self.reference_layer_identifier}/bbox/uuid/test/'
            ),
            os.path.join(self.responses_folder, 'georepo_bbox.json')
        )

        # Geojson containment
        responses.add(
            responses.POST,
            (
                f'{self.georepo_url}/operation/view/'
                f'{self.reference_layer_identifier}/containment-check/'
                f'ST_Intersects/0/ucode/?admin_level=1'
            ),
            status=200,
            json=json.loads(
                open(os.path.join(
                    self.responses_folder, 'georepo_containtment.json'), "r"
                ).read()
            )
        )

        # Arcgis definition
        self.mock_request(
            f'{self.arcgis_test_url}?f=json',
            os.path.join(self.responses_folder, 'arcgis_definition.json')
        )

        # Arcgis data
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%20100.0,%20%22ymax%22:%20100.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=0&resultRecordCount=100'

            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_1.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%20100.0,%20%22ymax%22:%20100.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=100&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_2.json')
        )

    @responses.activate
    def assert_results(
            self, values: dict, filter: str,
            statial_method: str, aggregation_method: str
    ):
        """Assert results of harvester."""
        self.mock_requests()
        attributes = self.attributes
        self.importer.save_attributes(
            {**attributes, **{
                'spatial_operator': statial_method,
                'aggregation': aggregation_method,
                'filter': filter
            }}, {}
        )
        self.importer.run()
        log = self.importer.importerlog_set.all().last()
        self.assertTrue(log.status in ['Success', 'Warning'])

        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(value.value, values[value.geom_id])
            self.assertEqual(value.indicator, self.indicator)
            entity = Entity.objects.get(
                geom_id=value.geom_id, reference_layer=self.reference_layer,
                admin_level=self.admin_level
            )
            self.assertEqual(entity.reference_layer, self.reference_layer)
            self.assertEqual(entity.admin_level, self.admin_level)
            self.assertEqual(entity.geom_id, value.geom_id)
