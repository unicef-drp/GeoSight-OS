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

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FiltersAccordion from "../../../../Dashboard/LeftPanel/Filters";
import { Actions } from "../../../../../store/dashboard/index";

import "./style.scss";

export function FiltersBeingHidden() {
  const dispatch = useDispatch();
  const { id, filters, filtersBeingHidden } = useSelector(
    (state) => state.dashboard.data,
  );
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!id && !edited) {
      if (filters?.queries?.length && filtersBeingHidden) {
        dispatch(Actions.Dashboard.updateFiltersBeingHidden());
      } else if (!filters?.queries?.length && !filtersBeingHidden) {
        dispatch(Actions.Dashboard.updateFiltersBeingHidden());
      }
    }
  }, [filters]);

  return (
    <FormControlLabel
      checked={filtersBeingHidden}
      control={<Checkbox />}
      onChange={(evt) => {
        setEdited(true);
        dispatch(Actions.Dashboard.updateFiltersBeingHidden());
      }}
      label={"Hide filter section"}
    />
  );
}

/** Filters dashboard */
export default function FiltersForm() {
  const dispatch = useDispatch();
  const filtersAllowModify = useSelector(
    (state) => state.dashboard.data?.filtersAllowModify,
  );

  return (
    <div className={"Filters"}>
      <FiltersBeingHidden />
      <div>
        <FormControlLabel
          checked={filtersAllowModify}
          control={<Checkbox />}
          onChange={(evt) => {
            dispatch(Actions.Dashboard.updateFiltersAllowModify());
          }}
          label={"Allow users to modify filters in dashboard"}
        />
      </div>
      <FiltersAccordion isAdmin={true} />
    </div>
  );
}
