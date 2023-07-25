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

/* ==========================================================================
   SUMMARY WIDGET EDITOR
   ========================================================================== */

import React, { Fragment } from 'react';

import EditSection from "../Editor"

/**
 * Edit section for widget.
 * @param {object} data Widget Data.
 * @param {object} selectedData selectedData Data.
 */
export function _SummaryWidgetEditSection({ data, selectedData }) {
  return <Fragment/>
}

/**
 * Edit section for widget.
 * @param {bool} open Is open or close.
 * @param {Function} setData Set data function.
 * @param {object} data Widget Data.
 */
export default function SummaryWidgetEditSection(
  { open, setData, data }
) {
  return <EditSection open={open} setData={setData} data={data}>
    <_SummaryWidgetEditSection/>
  </EditSection>
}
