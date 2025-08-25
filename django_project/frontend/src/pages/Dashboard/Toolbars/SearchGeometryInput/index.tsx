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

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import maplibregl from "maplibre-gl";

import { addLayerWithOrder } from "../../MapLibre/Render";
import { Variables } from "../../../../utils/Variables";
import SearchEntityOption from "../../../../components/SearchEntityOption";
import { GeorepoUrls, updateToken } from "../../../../utils/georepo";
import { removeLayer, removeSource } from "../../MapLibre/utils";
import { Entity } from "../../../../types/Entity";
import { Logger } from "../../../../utils/logger";
import { isDashboardToolEnabled } from "../../../../selectors/dashboard";

import "./style.scss";

const LAYER_HIGHLIGHT_ID = "reference-layer-highlight";

interface Props {
  map: maplibregl.Map;
}

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
export default function SearchGeometryInput({ map }: Props) {
  const enable_geometry_search = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.ENTITY_SEARCH_BOX),
  );

  const referenceLayerDataState = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData,
  );

  // When selected changed
  useEffect(() => {
    if (!map) {
      return;
    }
    removeLayer(map, LAYER_HIGHLIGHT_ID);
    removeSource(map, LAYER_HIGHLIGHT_ID);

    // CREATE HIGHLIGHT
    const tiles: any[] = [];
    Object.entries(referenceLayerDataState).forEach(([key, value]) => {
      // @ts-ignore
      const vectorTiles = value?.data?.vector_tiles;
      let vectorTileUrl = null;
      if (vectorTiles && map) {
        vectorTileUrl = GeorepoUrls.WithoutDomain(updateToken(vectorTiles));
      }
      if (vectorTiles) {
        tiles.push(vectorTileUrl);
      }
    });
    if (!tiles) {
      return;
    }
    map.addSource(LAYER_HIGHLIGHT_ID, {
      tiles: tiles,
      type: "vector",
      maxzoom: 8,
    });
  }, [map, referenceLayerDataState]);

  const selected = (entity: Entity): void => {
    if (!map) {
      return;
    }

    removeLayer(map, LAYER_HIGHLIGHT_ID);
    if (!entity) {
      return null;
    }

    const bbox = entity.bbox;
    Logger.log("SEARCH_GEOMETRY_INPUT:", bbox);
    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 20 },
    );

    // CREATE HIGHLIGHT
    addLayerWithOrder(
      map,
      {
        id: LAYER_HIGHLIGHT_ID,
        source: LAYER_HIGHLIGHT_ID,
        type: "line",
        "source-layer": "Level-" + entity.admin_level,
        paint: {
          "line-color": "#FF0000",
          "line-width": 10,
          "line-blur": 5,
        },
        filter: ["in", "ucode", entity.ucode],
      },
      Variables.LAYER_CATEGORY.HIGHTLIGHT,
    );
  };

  if (!enable_geometry_search) {
    return;
  }

  return (
    <div className="SearchGeometryInputComponent">
      <SearchEntityOption onSelected={selected} />
    </div>
  );
}
