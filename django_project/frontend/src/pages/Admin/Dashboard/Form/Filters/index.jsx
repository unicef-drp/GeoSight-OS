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
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import FiltersAccordion from "../../../../Dashboard/LeftPanel/Filters";
import { Actions } from "../../../../../store/dashboard/index";

import './style.scss';
import FormControlLabel from "@mui/material/FormControlLabel";

/**
 * Widget dashboard
 */
export default function FiltersForm() {
  const dispatch = useDispatch();
  const {
    filtersAllowModify,
    filtersBeingHidden
  } = useSelector(state => state.dashboard.data);

  return <div className={'Filters'}>
    <div>
      <FormControlLabel
        checked={filtersBeingHidden}
        control={<Checkbox/>}
        onChange={evt => {
          dispatch(Actions.Dashboard.updateFiltersBeingHidden())
        }}
        label={'Hide filter section'}/>
    </div>
    <div>
      <FormControlLabel
        checked={filtersAllowModify}
        control={<Checkbox/>}
        onChange={evt => {
          dispatch(Actions.Dashboard.updateFiltersAllowModify())
        }}
        label={'Allow users to modify filters in dashboard'}/>
    </div>
    <FiltersAccordion isAdmin={true}/>
  </div>
}