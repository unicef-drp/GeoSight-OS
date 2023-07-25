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

from geosight.data.models.related_table import RelatedTable
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.base import IndicatorValueLongFormat
from geosight.importer.importers.base.indicator_value import (
    ImporterTimeDataType, IndicatorDataType
)
from geosight.importer.importers.query_data import QueryDataImporter


class SpatialMethod(object):
    """Aggregation query."""

    INTERSECT = 'INTERSECT'
    COMPLETELY_WITHIN = 'COMPLETELY WITHIN'
    CENTROID_WITHIN = 'CENTROID WITHIN'
    DISTANCE_WITHIN = 'DISTANCE WITHIN'


class RelatedTableLongFormatIndicatorValue(
    IndicatorValueLongFormat, QueryDataImporter
):
    """Import data from Related Table."""

    attributes = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return IndicatorValueLongFormat.attributes_definition(
            **kwargs) + QueryDataImporter.attributes_definition(
            **kwargs) + [
            ImporterAttribute(
                name='related_table_id',
                input_type=ImporterAttributeInputType.NUMBER
            ),
        ]

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        self._update('Fetch related table data.')
        related_table_id = self.attributes.get('related_table_id', None)
        if not related_table_id:
            raise ImporterError("related_table_id is required")

        try:
            rt = RelatedTable.objects.get(id=related_table_id)
        except RelatedTable.DoesNotExist:
            raise ImporterError(
                f'Related table with ID {related_table_id} does not exist.'
            )

        self._update('Querying data.')

        # Return data by querying it
        group_field = self.attributes['key_administration_code']

        # Group by date_time
        date_time_data_type = self.get_attribute('date_time_data_type')
        if date_time_data_type == ImporterTimeDataType.DATA_DRIVEN:
            if not self.get_attribute('date_time_data_field'):
                raise ImporterError('Date information is not provided')
            group_field += f',{self.get_attribute("date_time_data_field")}'

        # Group by indicator
        indicator_data_type = self.get_attribute('indicator_data_type')
        if indicator_data_type == IndicatorDataType.DATA_DRIVEN:
            indicator_data_field = self.get_attribute('indicator_data_field')
            if not self.get_attribute('indicator_data_field'):
                raise ImporterError(
                    'Indicator field information is not provided'
                )
            group_field += f',{indicator_data_field}'

        return self.querying_data(
            data=rt.data,
            fields=rt.fields_definition,
            group_field=group_field,
            aggregation=self.attributes['aggregation'],
            input_filter=self.attributes.get('filter', None)
        )
