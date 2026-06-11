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
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";

import { addLayerWithOrder } from "../../MapLibre/utils/Render";
import { Variables } from "../../../../utils/Variables";
import { GeorepoUrls, updateToken } from "../../../../utils/georepo";
import { removeLayer, removeSource } from "../../MapLibre/utils";
import { Entity } from "../../../../types/Entity";
import { Logger } from "../../../../utils/logger";
import { Actions } from "../../../../store/dashboard";
import { DatasetView } from "../../../../types/DatasetView";

import "./style.scss";

const LAYER_HIGHLIGHT_ID = "reference-layer-highlight";

interface Props {
  map: maplibregl.Map;
  datasets: DatasetView[];
  isMain: boolean;
}

/** CompareLayer component. */
export default function SearchGeometryInputController({
  map,
  datasets,
  isMain,
}: Props) {
  const dispatch = useDispatch();
  // @ts-ignore
  const entities = useSelector((state) => state.map?.selectedEntities);
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

    const tiles: string[] = [];
    datasets?.filter(Boolean).forEach((dataset) => {
      const entry = referenceLayerDataState[dataset.identifier];
      const vectorTiles = entry?.data?.vector_tiles;
      if (vectorTiles) {
        tiles.push(GeorepoUrls.WithoutDomain(updateToken(vectorTiles)));
      }
    });
    if (!tiles.length) {
      return;
    }
    map.addSource(LAYER_HIGHLIGHT_ID, {
      tiles,
      type: "vector",
      maxzoom: 8,
    });
  }, [map, datasets, referenceLayerDataState]);

  /** Dashboard extent changed */
  useEffect(() => {
    if (entities?.length > 0) {
      selected(entities[0]);
    } else {
      removeLayer(map, LAYER_HIGHLIGHT_ID);
    }
  }, [map, entities]);

  const selected = (entity: Entity): void => {
    if (!map) {
      return;
    }

    removeLayer(map, LAYER_HIGHLIGHT_ID);
    if (!entity) {
      return null;
    }

    // Zoom to entity
    if (isMain) {
      const bbox = entity.bbox;
      Logger.log("SEARCH_GEOMETRY_INPUT:", bbox);
      dispatch(Actions.Map.updateExtent([bbox[0], bbox[1], bbox[2], bbox[3]]));
    }

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

  return <></>;
}
