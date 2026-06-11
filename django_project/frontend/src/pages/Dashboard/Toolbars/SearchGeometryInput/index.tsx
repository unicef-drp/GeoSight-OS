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
 * __date__ = '06/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Search Geometry
   ========================================================================== */

import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { Variables } from "../../../../utils/Variables";
import SearchEntityOption from "../../../../components/SearchEntityOption";
import { Entity } from "../../../../types/Entity";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";
import { Actions } from "../../../../store/dashboard";

import "./style.scss";

export function SearchGeometryMobile() {
  const entitySearchEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ENTITY_SEARCH_BOX),
  );
  if (!entitySearchEnable) {
    return;
  }
  return <div className="ToolbarMobileBottom Mobile"></div>;
}

/** CompareLayer component. */
export default function SearchGeometryInput() {
  const dispatch = useDispatch();
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  const enable_geometry_search = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ENTITY_SEARCH_BOX),
  );

  const selected = (entity: Entity): void => {
    dispatch(Actions.Map.updateSelectedEntities(entity ? [entity] : []));
  };

  if (!enable_geometry_search || !referenceLayer?.identifier) {
    return;
  }

  return (
    <div className="SearchGeometryInputComponent">
      <SearchEntityOption onSelected={selected} />
    </div>
  );
}
