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
 * __date__ = '23/06/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Search Geometry
   ========================================================================== */

import React, { memo } from "react";
import { Entity } from "../../types/Entity";
import ServerAutocomplete from "./ServerAutocomplete";

import "./style.scss";

export interface Props {
  onSelected: (entity: Entity) => void;
}

/** Search entity point component. */
function SearchEntityOption({ onSelected }: Props) {
  return (
    <ServerAutocomplete
      url={
        "https://staging-georepo.unitst.org/api/v1/search/view/13fd9923-d778-4b6b-af76-2c2c411eb5e3/entity/list/"
      }
      pageSize={100}
    />
  );
}

export default memo(SearchEntityOption);
