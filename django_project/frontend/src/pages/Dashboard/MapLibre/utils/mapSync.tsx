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

const registry: Record<number, maplibregl.Map> = {};

/** Which map ID is currently broadcasting a sync (null = no sync in progress). */
let syncingFrom: number | null = null;

/** Register a map instance and start syncing its movements to all others. */
export function registerMap(id: number, map: maplibregl.Map) {
  registry[id] = map;

  map.on("move", () => {
    if (syncingFrom !== null) return;
    syncingFrom = id;
    Object.entries(registry).forEach(([otherId, otherMap]) => {
      if (parseInt(otherId) !== id) {
        otherMap.jumpTo({
          center: map.getCenter(),
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      }
    });
    syncingFrom = null;
  });
}

/** Unregister a map instance (call on component unmount). */
export function unregisterMap(id: number) {
  delete registry[id];
}