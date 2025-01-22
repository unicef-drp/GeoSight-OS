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
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterGroupDataProps } from "./types.d";
import FilterGroup from "./Group";
import { INIT_DATA } from "../../../utils/queryExtraction";
import { Actions } from "../../../store/dashboard";

import './style.scss';


export interface Props {
  isAdmin: boolean;
}

/** Filter control
 * @constructor
 */
const FilterControl = ({ isAdmin }: Props) => {
  const dispatcher = useDispatch()
  // @ts-ignore
  const filterState = useSelector(state => state.dashboard?.data['filters']);
  const filter = (filterState && Object.keys(filterState).length ? filterState : INIT_DATA.GROUP()) as FilterGroupDataProps;

  /** Update query */
  const updateQuery = () => {
    dispatcher(
      Actions.Filters.update({ ...filter })
    )
  }

  // UpdateFilter callbacks
  const updateFilter = useCallback((data: string[]) => {
    if (data === undefined) {
      dispatcher(Actions.FilteredGeometries.update(null))
    } else if (data === null) {
      dispatcher(Actions.FilteredGeometries.update([]))
    } else {
      dispatcher(Actions.FilteredGeometries.update(data))
    }
  }, []);

  return <FilterGroup
    /* Query global */
    query={filter}
    updateQuery={updateQuery}

    /* Is master */
    isMaster={true}
    isAdmin={isAdmin}
    updateFilter={updateFilter}
  />
};

const FilterContent = memo(({ isAdmin }: Props) => {
  // @ts-ignore
  const { editMode } = useSelector(state => state.globalState)
  // @ts-ignore
  const { filtersAllowModify } = useSelector(state => state.dashboard?.data)

  if ((!isAdmin && editMode) || isAdmin && !editMode) {
    return
  }
  return <div className='FilterControl'>
    <FilterControl
      isAdmin={filtersAllowModify ? filtersAllowModify : isAdmin}
    />
  </div>;
});

export default FilterContent;