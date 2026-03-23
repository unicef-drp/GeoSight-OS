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
 * __date__ = '23/03/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Zoom To Geometries by Filters
   This is called and triggered when we do filters
   And "Zoom in automatically in filtered areas" is true
   ========================================================================== */

import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import LinearProgress from "@mui/material/LinearProgress";
import { Session } from "../../utils/Sessions";
import GeorepoRequest from "../../utils/GeorepoRequest";
import { Logger } from "../../utils/logger";

import "./style.scss";

export interface Props {
  map: maplibregl.Map;
}

/**
 * Zoom To Geometries by Filters.
 */
export default function ZoomToFilteredGeometries({ map }: Props) {
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  // @ts-ignore
  const autoZoomToFilter = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.auto_zoom_to_filter,
  );
  // @ts-ignore
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  // @ts-ignore
  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  // @ts-ignore
  const referenceLayerData = useSelector((state) => state.datasetGeometries);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!autoZoomToFilter || !map || !filteredGeometries?.length) {
        return;
      }
      const usedConceptUUIDs: string[] = [];
      setIsLoading(true);
      Object.entries(referenceLayerData).forEach(([key, value]) => {
        // @ts-ignore
        const data = value[selectedAdminLevel.level];
        Object.keys(data).map((conceptUUID) => {
          if (filteredGeometries.includes(conceptUUID)) {
            usedConceptUUIDs.push(conceptUUID);
          }
        });
      });
      const session = new Session("ZoomToGeometriesByFilters", 1000);
      const georepoRequest = new GeorepoRequest(!referenceLayer.is_local);
      let bbox: number[] = [];
      try {
        bbox = await georepoRequest.getBbox(
          referenceLayer.identifier,
          "concept_uuid",
          usedConceptUUIDs,
        );
      } catch (_) {
        setIsLoading(false);
        return;
      }
      if (session.isValid) {
        Logger.log("BBOX: ", bbox);
        if (bbox?.length === 4) {
          map.fitBounds(
            [
              [bbox[0], bbox[1]],
              [bbox[2], bbox[3]],
            ],
            { padding: { top: 20, bottom: 20, left: 20, right: 20 } },
          );
        }
        setIsLoading(false);
      }
    })();
  }, [filteredGeometries, selectedAdminLevel]);

  return (
    <div className={"ZoomToFilteredGeometries" + (!isLoading ? " Hidden" : "")}>
      <LinearProgress variant="determinate" value={50} />
    </div>
  );
}
