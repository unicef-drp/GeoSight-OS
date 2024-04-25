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
import ModalSelector from './Modal'
import './style.scss';

import { relatedTableColumns } from '../RelatedTable/List/Attributes'

/**
 * For group data selection.
 * @param {boolean} open Is modal opened.
 * @param {Function} setOpen Function of set open.
 * @param {Array} selectedData Selected group.
 * @param {Function} selectedDataChanged Function of Selected group changed.
 * @param {Boolean} isMultiple Is data returned multiple object.
 * */
export default function RelatedTableSelector(
  {
    open,
    setOpen,
    selectedData,
    selectedDataChanged,
    isMultiple
  }
) {
  return <ModalSelector
    title={"Indicator(s)"}
    api={'/api/related-table/list'}
    columns={relatedTableColumns}
    open={open}
    setOpen={setOpen}
    selectedData={selectedData}
    selectedDataChanged={selectedDataChanged}
    defaultSorting={[{ field: 'name', sort: 'asc' }]}
    isMultiple={isMultiple}
  />

}