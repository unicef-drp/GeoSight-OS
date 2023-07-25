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

from geosight.importer.exception import ImporterDoesNotExist


class ImportType(object):
    """A quick couple of variable and importer type."""

    RELATED_TABLE = 'Related Tables'
    INDICATOR_VALUE = 'Indicator Value'


class InputFormat(object):
    """A quick couple of variable and import format."""

    EXCEL_WIDE = 'Excel Wide Format'
    EXCEL_LONG = 'Excel Long Format'
    SHAREPOINT_EXCEL_WIDE = 'SharePoint Wide Format'
    SHAREPOINT_EXCEL_LONG = 'SharePoint Long Format'
    API_WITH_GEOGRAPHY_WIDE = 'API With Geography Wide Format'
    API_WITH_GEOGRAPHY_LONG = 'API With Geography Long Format'
    VECTOR_CONTEXT_LAYER = 'Vector Context Layer Format'
    RELATED_TABLE_LAYER = 'Related Table Format'
    SDMX = 'SDMX Format'
    FORMULA_BASED_ON_OTHER_INDICATORS = 'Formula Based on Other Indicators'


class ScheduleType(object):
    """A quick couple of variable and schedule type format."""

    SINGLE_IMPORT = 'Single Import'
    SCHEDULED_IMPORT = 'Scheduled Import'


class ScheduleStatus(object):
    """A quick couple of variable and status format."""

    ACTIVE = 'Active'
    PAUSED = 'Paused'


class ImporterClass(object):
    """Importer Class."""

    def __init__(self, import_type: str, input_format: str):
        """init."""
        self.import_type = import_type
        self.input_format = input_format

    def get(self):
        """Return importer class."""
        # Excel importers
        from geosight.importer.importers.excel import (
            IndicatorValueExcelWideFormat,
            IndicatorValueExcelLongFormat,
            RelatedTableExcelWideFormat
        )
        # Sharepoint importers
        from geosight.importer.importers.sharepoint import (
            IndicatorValueSharepointExcelLongFormat,
            IndicatorValueSharepointExcelWideFormat,
            RelatedTableSharepointExcelWideFormat
        )
        # API importers
        from geosight.importer.importers.api import (
            IndicatorValueApiLongFormat,
            IndicatorValueApiWideFormat,
            RelatedTableApiWideFormat
        )

        # Context Layer
        from geosight.importer.importers.vector_context_layer import (
            VectorContextLayerIndicatorValue
        )

        # Related Table
        from geosight.importer.importers.related_table import (
            RelatedTableLongFormatIndicatorValue
        )

        # SDMX
        from geosight.importer.importers.sdmx import (
            SDMXIndicatorValueFormat, SDMXRelatedTableFormat
        )

        # Formula Based on Other Indicators
        from geosight.importer.importers import (
            FormulaBasedOnOtherIndicatorsIndicatorValue
        )

        importers = {
            # Excel
            InputFormat.EXCEL_WIDE: {
                ImportType.INDICATOR_VALUE: IndicatorValueExcelWideFormat,
                ImportType.RELATED_TABLE: RelatedTableExcelWideFormat,
            },
            InputFormat.EXCEL_LONG: {
                ImportType.INDICATOR_VALUE: IndicatorValueExcelLongFormat,
            },

            # Sharepoint
            InputFormat.SHAREPOINT_EXCEL_WIDE: {
                ImportType.INDICATOR_VALUE:
                    IndicatorValueSharepointExcelWideFormat,
                ImportType.RELATED_TABLE:
                    RelatedTableSharepointExcelWideFormat,
            },
            InputFormat.SHAREPOINT_EXCEL_LONG: {
                ImportType.INDICATOR_VALUE:
                    IndicatorValueSharepointExcelLongFormat,
            },

            # API
            InputFormat.API_WITH_GEOGRAPHY_WIDE: {
                ImportType.INDICATOR_VALUE: IndicatorValueApiWideFormat,
                ImportType.RELATED_TABLE: RelatedTableApiWideFormat,
            },
            InputFormat.API_WITH_GEOGRAPHY_LONG: {
                ImportType.INDICATOR_VALUE: IndicatorValueApiLongFormat,
            },

            # Vector Context Layer
            InputFormat.VECTOR_CONTEXT_LAYER: {
                ImportType.INDICATOR_VALUE: VectorContextLayerIndicatorValue,
            },

            # Vector Context Layer
            InputFormat.RELATED_TABLE_LAYER: {
                ImportType.INDICATOR_VALUE:
                    RelatedTableLongFormatIndicatorValue,
            },

            # Vector Context Layer
            InputFormat.SDMX: {
                ImportType.INDICATOR_VALUE: SDMXIndicatorValueFormat,
                ImportType.RELATED_TABLE: SDMXRelatedTableFormat
            },

            # Vector Context Layer
            InputFormat.FORMULA_BASED_ON_OTHER_INDICATORS: {
                ImportType.INDICATOR_VALUE:
                    FormulaBasedOnOtherIndicatorsIndicatorValue
            },
        }
        try:
            return importers[self.input_format][self.import_type]
        except KeyError:
            raise ImporterDoesNotExist()
