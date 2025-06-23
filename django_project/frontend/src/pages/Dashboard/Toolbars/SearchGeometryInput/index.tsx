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
import { useSelector } from "react-redux";
import { GeorepoUrls, updateToken } from "../../../../utils/georepo";
import { removeLayer, removeSource } from "../../MapLibre/utils";

import "./style.scss";
import { addLayerWithOrder } from "../../MapLibre/Render";
import { Variables } from "../../../../utils/Variables";
import SearchEntityOption from "../../../../components/SearchEntityOption";
import { Entity } from "../../../../types/Entity";
import maplibregl from "maplibre-gl";

const LAYER_HIGHLIGHT_ID = "reference-layer-highlight";

interface Props {
  map: maplibregl.Map;
}

/**
 * CompareLayer component.
 */
export default function SearchGeometryInput({ map }: Props) {
  const {
    enable_geometry_search,
    // @ts-ignore
  } = useSelector((state) => state.dashboard.data);

  const referenceLayerDataState = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData,
  );

  const selected = (entity: Entity): void => {
    if (!map) {
      return;
    }

    removeLayer(map, LAYER_HIGHLIGHT_ID);
    removeSource(map, LAYER_HIGHLIGHT_ID);
    if (!entity) {
      return null;
    }

    const bbox = entity.bbox;
    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 20 },
    );

    // CREATE HIGHLIGHT
    const datasetIdentifier = entity.dataset;
    const referenceLayerData = referenceLayerDataState[datasetIdentifier];
    const vectorTiles = referenceLayerData?.data?.vector_tiles;
    let vectorTileUrl = null;
    if (vectorTiles && map) {
      vectorTileUrl = GeorepoUrls.WithoutDomain(updateToken(vectorTiles));
    }
    if (!vectorTiles) {
      return;
    }
    map.addSource(LAYER_HIGHLIGHT_ID, {
      tiles: [vectorTileUrl],
      type: "vector",
      maxzoom: 8,
    });

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
      },
      Variables.LAYER_CATEGORY.HIGHTLIGHT,
    );
    if (entity && entity.ucode) {
      map.setFilter(LAYER_HIGHLIGHT_ID, ["in", "ucode", entity.ucode]);
    }
  };

  if (!enable_geometry_search) {
    return;
  }

  return <SearchEntityOption onSelected={selected} />;
}
