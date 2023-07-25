/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from 'react';

// API
import {
  ApiLongIndicatorValue,
  ApiWideIndicatorValue,
  ApiWideRelatedTable
} from './Extensions/API';

// Excel
import {
  LongExcelIndicatorValue,
  WideExcelIndicatorValue,
  WideExcelRelatedTable
} from './Extensions/Excel';

// Sharepoint
import {
  SharepointLongExcelIndicatorValue,
  SharepointWideExcelIndicatorValue,
  SharepointWideExcelRelatedTable
} from './Extensions/Sharepoint';

// VectorContextLayer
import { VectorContextLayer } from './Extensions/VectorContextLayer';

// RelatedTable
import { RelatedTableFormat } from './Extensions/RelatedTable';

// SDMX
import { SDMXIndicatorValue, SDMXRelatedTable } from './Extensions/SDMX';

// Formula Based on Other Indicators
import {
  FormulaBasedIndicatorValue
} from './Extensions/FormulaBasedOnOtherIndicators';


export const _importTypes = {
  IndicatorValue: 'Indicator Value',
  RelatedTables: 'Related Tables',
}
export const _inputFormats = {
  APILongFormat: 'API With Geography Long Format',
  APIWideFormat: 'API With Geography Wide Format',
  ExcelLongFormat: 'Excel Long Format',
  ExcelWideFormat: 'Excel Wide Format',
  SharePointLongFormat: 'SharePoint Long Format',
  SharePointWideFormat: 'SharePoint Wide Format',
  VectorContextLayerFormat: 'Vector Context Layer Format',
  SDMXFormat: 'SDMX Format',
  RelatedTableFormat: 'Related Table Format',
  FormulaBased: 'Formula Based on Other Indicators',
}
export const _scheduleTypes = {
  SingleImport: 'Single Import',
  ScheduledImport: 'Scheduled Import'
}

export const Forms = {
  [_importTypes.IndicatorValue]: {
    [_inputFormats.APILongFormat]: {
      Form: ApiLongIndicatorValue
    },
    [_inputFormats.APIWideFormat]: {
      Form: ApiWideIndicatorValue
    },
    [_inputFormats.ExcelLongFormat]: {
      Form: LongExcelIndicatorValue,
      scheduleTypes: [_scheduleTypes.SingleImport]
    },
    [_inputFormats.ExcelWideFormat]: {
      Form: WideExcelIndicatorValue,
      scheduleTypes: [_scheduleTypes.SingleImport]
    },
    [_inputFormats.SharePointLongFormat]: {
      Form: SharepointLongExcelIndicatorValue
    },
    [_inputFormats.SharePointWideFormat]: {
      Form: SharepointWideExcelIndicatorValue
    },
    [_inputFormats.VectorContextLayerFormat]: {
      Form: VectorContextLayer
    },
    [_inputFormats.SDMXFormat]: {
      Form: SDMXIndicatorValue
    },
    [_inputFormats.RelatedTableFormat]: {
      Form: RelatedTableFormat
    },
    [_inputFormats.FormulaBased]: {
      Form: FormulaBasedIndicatorValue
    },
  },
  [_importTypes.RelatedTables]: {
    [_inputFormats.APIWideFormat]: {
      Form: ApiWideRelatedTable
    },
    [_inputFormats.ExcelWideFormat]: {
      Form: WideExcelRelatedTable,
      scheduleTypes: [_scheduleTypes.SingleImport]
    },
    [_inputFormats.SharePointWideFormat]: {
      Form: SharepointWideExcelRelatedTable
    },
    [_inputFormats.SDMXFormat]: {
      Form: SDMXRelatedTable
    },
  }
}


