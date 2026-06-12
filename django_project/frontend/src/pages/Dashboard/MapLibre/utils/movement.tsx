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
 * __date__ = '04/06/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import maplibregl from "maplibre-gl";

/** Apply zoom to extent. */
export const zoomToExtent = (
  map: maplibregl.Map,
  extent: [number, number, number, number],
  id: number,
) => {
  setTimeout(function () {
    const rightContent = document.querySelector(
      ".RightContent .right",
    ) as HTMLElement;
    const isMobile = window.innerWidth <= 1000;
    const rightPadding =
      id != 0 || isMobile ? 0 : (rightContent?.offsetWidth ?? 0);
    map.fitBounds(
      [
        [extent[0], extent[1]],
        [extent[2], extent[3]],
      ],
      {
        pitch: 0,
        bearing: 0,
        padding: { top: 0, bottom: 0, left: 0, right: rightPadding },
      },
    );
  }, 100);
};
