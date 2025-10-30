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
 * __date__ = '16/06/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Transparency from "../../../TransparencySlider";
import { Actions } from "../../../../store/dashboard";

export interface Props {
  transparencyKey: string;
}

export function GlobalIndicatorLayerTransparency({ transparencyKey }: Props) {
  const dispatch = useDispatch();
  const dashboardTransparency = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.transparency_config[transparencyKey],
  );
  const currTransparency = useSelector(
    // @ts-ignore
    (state) => state.map?.transparency[transparencyKey],
  );

  console.log(dashboardTransparency);

  // When dashboard transparency indicator layer changed
  useEffect(() => {
    if (dashboardTransparency === undefined) {
      dispatch(Actions.Map.updateTransparency(transparencyKey, 100));
    } else {
      dispatch(
        Actions.Map.updateTransparency(transparencyKey, dashboardTransparency),
      );
    }
  }, [dashboardTransparency]);

  return (
    <Transparency
      value={currTransparency}
      onChange={(value) =>
        dispatch(Actions.Map.updateTransparency(transparencyKey, value))
      }
      onChangeCommitted={(value) =>
        dispatch(Actions.Map.updateTransparency(transparencyKey, value))
      }
    />
  );
}
