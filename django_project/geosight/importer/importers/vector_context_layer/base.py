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

from typing import List

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.georepo.request import GeorepoRequest
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.base import IndicatorValueLongFormat
from geosight.importer.importers.base.indicator_value import AdminLevelType
from geosight.importer.importers.query_data import QueryDataImporter


class SpatialMethod(object):
    """Aggregation query."""

    INTERSECT = 'INTERSECT'
    COMPLETELY_WITHIN = 'COMPLETELY WITHIN'
    CENTROID_WITHIN = 'CENTROID WITHIN'
    DISTANCE_WITHIN = 'DISTANCE WITHIN'


class VectorContextLayerIndicatorValue(
    IndicatorValueLongFormat, QueryDataImporter
):
    """Import data from api."""

    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return IndicatorValueLongFormat.attributes_definition(
            **kwargs) + QueryDataImporter.attributes_definition(
            **kwargs) + [
                   ImporterAttribute(
                       name='context_layer_id',
                       input_type=ImporterAttributeInputType.NUMBER
                   ),
                   ImporterAttribute(
                       name='geometry_type',
                       input_type=ImporterAttributeInputType.TEXT,
                       options=["Point", "Line", "Polygon"],
                       required=False
                   ),
                   ImporterAttribute(
                       name='spatial_operator',
                       input_type=ImporterAttributeInputType.TEXT
                   ),
               ]

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        # Check context layer
        context_layer_id = self.attributes.get('context_layer_id', None)
        if not context_layer_id:
            raise ImporterError("context_layer_id is required")

        try:
            ctx = ContextLayer.objects.get(id=context_layer_id)
            if ctx.layer_type not in [LayerType.ARCGIS, LayerType.GEOJSON]:
                raise ImporterError(
                    f"Harvester can't run type {ctx.layer_type}."
                )

        except ContextLayer.DoesNotExist:
            raise ImporterError(
                f'Context layer with ID {context_layer_id} does not exist.'
            )

        spatial_operator = self.attributes['spatial_operator']
        bbox = self.importer.reference_layer.bbox()
        if not bbox:
            raise ImporterError('The reference layer is empty.')

        # -------------------------------------------------
        # Get bbox
        # Check admin level
        # If is it distance within, need to widen the bbox
        spatial_operator_method = spatial_operator.split('=')[0]
        try:
            spatial_operator_value = spatial_operator.split('=')[1]
        except IndexError:
            spatial_operator_value = 0
        if spatial_operator_method == SpatialMethod.DISTANCE_WITHIN:
            bbox[0] -= 10
            bbox[1] -= 10
            bbox[2] += 10
            bbox[3] += 10

        # -------------------------------------------------
        # Preparing spatial query
        spatial_operator_param = ''
        if spatial_operator_method:
            spatial_operator_method = spatial_operator_method.upper()
            if spatial_operator_method == SpatialMethod.INTERSECT:
                spatial_operator_param = 'ST_Intersects'
            elif spatial_operator_method == SpatialMethod.COMPLETELY_WITHIN:
                spatial_operator_param = 'ST_Within'
            elif spatial_operator_method == SpatialMethod.CENTROID_WITHIN:
                spatial_operator_param = 'ST_Within(ST_Centroid)'
            elif spatial_operator_method == SpatialMethod.DISTANCE_WITHIN:
                # Special query for this distance within
                if not spatial_operator_value:
                    raise ImporterError(
                        f'Spatial operator {spatial_operator_method} '
                        'needs distance.'
                    )
                spatial_operator_param = 'ST_DWithin'
            else:
                raise ImporterError(
                    f'Spatial operator {spatial_operator_method} '
                    'is not recognized.'
                )

        # -------------------------------------------------
        # Get data from bbox
        self._update('Fetching context layer data.')
        data = ctx.geojson(bbox=bbox)

        # Get admin level
        admin_level = None
        admin_level_type = self.get_attribute('admin_level_type')
        if admin_level_type == AdminLevelType.BY_VALUE:
            admin_level = self.get_attribute('admin_level_value')
        elif admin_level_type == AdminLevelType.DATA_DRIVEN:
            raise ImporterError(
                f'Admin level can not be {AdminLevelType.DATA_DRIVEN}.'
            )
        if admin_level is None:
            raise ImporterError('Admin level is required.')

        # -------------------------------------------------
        # Get data with ucode on it
        data = GeorepoRequest().View.containment(
            self.importer.reference_layer.identifier,
            spatial_query=spatial_operator_param,
            distance=spatial_operator_value,
            admin_level=admin_level,
            geojson=data
        )
        self._update('Check geom data on georepo.')

        # -------------------------------------------------
        # Get field definition
        definition = ctx.arcgis_definition.json()
        fields = [
            {
                'name': 'ucode',
                'type': 'VARCHAR'
            }
        ]
        for field in definition['fields']:
            field_type = field['type']
            column_name = field['name']
            if field_type in ['esriFieldTypeOID', 'esriFieldTypeInteger']:
                column_type = 'INT'
            elif field_type == 'esriFieldTypeDouble':
                column_type = 'DOUBLE PRECISION'
            elif field_type == 'esriFieldTypeDate':
                column_type = 'DATE'
            else:
                column_type = 'VARCHAR'

            fields.append({
                'name': column_name,
                'type': column_type
            })

        # Return data by querying it
        return self.querying_data(
            data=[feature['properties'] for feature in data['features']],
            fields=fields,
            group_field='ucode',
            aggregation=self.attributes['aggregation'],
            input_filter=self.attributes.get('filter', None)
        )
