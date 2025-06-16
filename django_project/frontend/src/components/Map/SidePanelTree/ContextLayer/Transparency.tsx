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

export interface Props {}

export function GlobalContextLayerTransparency({}: Props) {
  const dispatch = useDispatch();
  const {
    contextLayer,
    // @ts-ignore
  } = useSelector((state) => state.dashboard.data?.transparency_config);
  const {
    contextLayer: currTransparency,
    // @ts-ignore
  } = useSelector((state) => state.map?.transparency);

  // When dashboard transparency context layer changed
  useEffect(() => {
    if (contextLayer === undefined) {
      dispatch(Actions.Map.updateTransparency("contextLayer", 100));
    } else {
      dispatch(Actions.Map.updateTransparency("contextLayer", contextLayer));
    }
  }, [contextLayer]);

  return (
    <Transparency
      value={currTransparency}
      onChange={(value) =>
        dispatch(Actions.Map.updateTransparency("contextLayer", value))
      }
      onChangeCommitted={(value) =>
        dispatch(Actions.Map.updateTransparency("contextLayer", value))
      }
    />
  );
}
