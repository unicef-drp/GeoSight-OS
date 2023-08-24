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

import React, { Fragment } from 'react';
import {
  LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import TextField from '@mui/material/TextField';
import {
  DatasetFilterSelector,
  IndicatorFilterSelector,
} from "../ModalSelector/ModalFilterSelector";
import {
  MultipleCreatableFilter
} from "../ModalSelector/ModalFilterSelector/MultipleCreatableFilter";
import { AdminListContent } from "../AdminList";
import { pageNames } from "../index";


/*** Dataset list **/
export default function DatasetList(
  { filters, setFilters, rightHeader, tableHeader, ...props }
) {
  return <Fragment>
    <AdminListContent
      rightHeader={rightHeader}
      tableHeader={tableHeader}
      pageName={pageNames.Dataset}
      otherFilters={
        <div className='ListAdminFilters'>
          <IndicatorFilterSelector
            data={filters.indicators}
            setData={newFilter => setFilters({
              ...filters,
              indicators: newFilter
            })}/>
          <DatasetFilterSelector
            data={filters.datasets}
            setData={newFilter => setFilters({
              ...filters,
              datasets: newFilter
            })}/>
          <MultipleCreatableFilter
            title={'Filter by Level(s)'}
            data={filters.levels}
            setData={newFilter => setFilters({
              ...filters,
              levels: newFilter
            })}/>
          <MultipleCreatableFilter
            title={'Filter by Geography(s)'}
            data={filters.geographies}
            setData={newFilter => setFilters({
              ...filters,
              geographies: newFilter
            })}/>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label="Filter from"
              inputFormat="YYYY-MM-DD"
              maxDate={filters.toTime}
              value={filters.fromTime}
              onChange={newFilter => setFilters({
                ...filters,
                fromTime: newFilter
              })}
              renderInput={(params) => <TextField {...params} />}
            />
            <DesktopDatePicker
              label="Filter to"
              inputFormat="YYYY-MM-DD"
              minDate={filters.fromTime}
              value={filters.toTime}
              onChange={newFilter => setFilters({
                ...filters,
                toTime: newFilter
              })}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
      }
      {...props}
    />
  </Fragment>
}