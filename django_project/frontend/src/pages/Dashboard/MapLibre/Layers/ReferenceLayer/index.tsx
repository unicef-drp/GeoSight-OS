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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { Feature } from "geojson";
import { useDispatch, useSelector } from "react-redux";
import { MVTLayer } from "@deck.gl/geo-layers/typed";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { DataFilterExtension } from "@deck.gl/extensions/typed";
import { MapboxOverlay } from "@deck.gl/mapbox/typed";
import { area as turfArea, bboxPolygon } from "@turf/turf";
import {
  extractCode,
  GeorepoUrls,
  updateToken,
} from "../../../../../utils/georepo";
import { allDataIsReady } from "../../../../../utils/indicators";
import { returnStyle } from "../../../../../utils/referenceLayer";
import { dictDeepCopy, hexToRGBList } from "../../../../../utils/main";
import {
  getIndicatorValueByGeometry
} from "../../../../../utils/indicatorData";
import { hasLayer, removeLayer, removeSource } from "../../utils";
import { popup } from "./Popup";
import {
  getLayerData,
  referenceLayerIndicatorLayer,
} from "../../../../../utils/indicatorLayer";
import {
  dynamicStyleTypes,
  returnLayerStyleConfig,
  returnNoDataStyle,
} from "../../../../../utils/Style";
import GeorepoAuthorizationModal
  from "../../../../../components/GeorepoAuthorizationModal";
import { IS_DEBUG, Logger } from "../../../../../utils/logger";
import { Actions } from "../../../../../store/dashboard";
import { addLayerWithOrder } from "../../utils/Render";
import { Variables } from "../../../../../utils/Variables";
import { isProjectUsingConceptUUID } from "../../../../../selectors/dashboard";
import maplibregl, { FilterSpecification } from "maplibre-gl";
import { DatasetView } from "../../../../../types/DatasetView";
import { IndicatorValues } from "../../../../../types/IndicatorValue";
import {
  IndicatorLayer,
  IndicatorLayerConfig,
} from "../../../../../types/IndicatorLayer";

export const CONTEXT_LAYER_ID = `context-layer`;
const MAX_ELEVATION = 500000;

const defaultColor = {
  fillColor: preferences.style_no_data_fill_color
    ? preferences.style_no_data_fill_color
    : `rgba(0, 0, 0, 0)`,
  outlineColor: preferences.style_no_data_fill_color
    ? preferences.style_no_data_outline_color
    : `rgba(0, 0, 0, 0)`,
  outlineSize: preferences.style_no_data_outline_size
    ? preferences.style_no_data_outline_size
    : 1,
};
const INDICATOR_LABEL_ID = "indicator-label";
const LAYER_HIGHLIGHT_ID = "reference-layer-highlight";

// Layer keys
export const REFERENCE_LAYER_ID_KEY = `reference-layer`;
export const FILL_LAYER_ID_KEY = REFERENCE_LAYER_ID_KEY + "-fill";
const OUTLINE_LAYER_ID_KEY = REFERENCE_LAYER_ID_KEY + "-outline";

export interface DeckGlFeatureData {
  elevation: number;
  fillColor: string;
  currElevation?: number;
}

export interface ReferenceLayerProps {
  id: string;
  referenceLayer: DatasetView;
  map: maplibregl.Map;
  deckgl: MapboxOverlay;

  // Layers
  firstLayer: IndicatorLayer;
  secondLayer: IndicatorLayer;
}

/** ReferenceLayerSelector selector. */
export function ReferenceLayer({
  id,
  map,
  deckgl,
  referenceLayer,

  // Layers
  firstLayer,
  secondLayer,
}: ReferenceLayerProps) {
  const dispatch = useDispatch();

  // Layer IDs scoped to this instance
  const REFERENCE_LAYER_ID = REFERENCE_LAYER_ID_KEY + "-" + id;
  const FILL_LAYER_ID = FILL_LAYER_ID_KEY + "-" + id;
  const OUTLINE_LAYER_ID = OUTLINE_LAYER_ID_KEY + "-" + id;

  // Dashboard config
  const referenceLayerProject = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  const indicatorLayers = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicatorLayers,
  );
  // @ts-ignore
  const indicators = useSelector((state) => state.dashboard.data?.indicators);
  const relatedTables = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.relatedTables,
  );
  // @ts-ignore
  const geoField = useSelector((state) => state.dashboard.data?.geoField);

  // Map state
  // @ts-ignore
  const indicatorShow = useSelector((state) => state.map?.indicatorShow);
  const indicatorLayerTransparency = useSelector(
    // @ts-ignore
    (state) => state.map?.transparency?.indicatorLayer,
  );
  const transparency = indicatorLayerTransparency / 100;
  const is3DView = useSelector(
    // @ts-ignore
    (state) => state.map?.is3dMode,
  );
  const compareMode = useSelector(
    // @ts-ignore
    (state) => state.mapMode?.compareMode,
  );

  // Reference layer
  const referenceLayerData = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData[referenceLayer?.identifier],
  );

  // Indicator / related table data
  // @ts-ignore
  const indicatorsData = useSelector((state) => state.indicatorsData);
  // @ts-ignore
  const relatedTableData = useSelector((state) => state.relatedTableData);
  // @ts-ignore
  const indicatorLayersData = useSelector((state) => state.indicatorLayersData);

  // Filters & selection
  // @ts-ignore
  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  // @ts-ignore
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  // @ts-ignore
  const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);
  const selectedGlobalTimeConfig = useSelector(
    // @ts-ignore
    (state) => state.selectedGlobalTimeConfig,
  );

  // State
  const [is3DInit, setIs3DInit] = useState(false);
  const [layerCreated, setLayerCreated] = useState(false);
  const [referenceLayerConfig, setReferenceLayerConfig] = useState({});

  // Per-instance mutable refs (not shared across map instances)
  const deckGlData = useRef<Record<string, DeckGlFeatureData | null>>({});
  const deckGlElevationTime = useRef(0);
  const deckGlAnimationDate = useRef<number | null>(null);
  const currentRenderDataString = useRef("");
  const firstLayerStringData = useRef("");
  const secondLayerStringData = useRef("");
  const currentCompareMode = useRef(false);
  const prevCurrentLevel = useRef<number | null>(null);

  // Derived
  const geomFieldOnVectorTile = useSelector(isProjectUsingConceptUUID())
    ? "concept_uuid"
    : "ucode";
  const compareOutlineSize = preferences.style_compare_mode_outline_size;

  const isReady = () => {
    return (
      map && hasLayer(map, FILL_LAYER_ID) && hasLayer(map, OUTLINE_LAYER_ID)
    );
  };

  let levels = referenceLayerData?.data?.dataset_levels;
  let currentLevel = selectedAdminLevel
    ? selectedAdminLevel.level
    : levels?.level;

  // When indicator data, current layer, second layer and compare mode changed
  // Update the style
  useEffect(() => {
    const data = getLayerData(
      indicatorsData,
      relatedTableData,
      firstLayer,
      referenceLayerProject,
      false,
      indicatorLayersData,
    ).concat(
      getLayerData(
        indicatorsData,
        relatedTableData,
        secondLayer,
        referenceLayerProject,
        false,
        indicatorLayersData,
      ),
    );
    if (allDataIsReady(data)) {
      const dataInString = JSON.stringify(data);
      const firstLayerString = JSON.stringify(firstLayer);
      const secondLayerString = JSON.stringify(secondLayer);
      if (
        currentRenderDataString.current !== dataInString ||
        firstLayerStringData.current !== firstLayerString ||
        secondLayerStringData.current !== secondLayerString ||
        currentCompareMode.current !== compareMode ||
        currentLevel !== prevCurrentLevel.current
      ) {
        updateStyle();
        currentRenderDataString.current = dataInString;
        firstLayerStringData.current = firstLayerString;
        secondLayerStringData.current = secondLayerString;
        currentCompareMode.current = compareMode;
        prevCurrentLevel.current = currentLevel;
      }
    }
  }, [
    indicatorsData,
    firstLayer,
    secondLayer,
    compareMode,
    layerCreated,
    relatedTableData,
    geomFieldOnVectorTile,
    currentLevel,
    indicatorLayersData,
  ]);

  // When reference layer, it's data, admin and show/hide changed.
  // Change the source
  useEffect(() => {
    if (referenceLayerData) {
      createLayer();
    } else {
      setReferenceLayerConfig({});
      removeAllLayers();
    }
  }, [referenceLayer, referenceLayerData, selectedAdminLevel]);

  // Rerender if filter changed.
  useEffect(() => {
    if (IS_DEBUG) {
      if (filteredGeometries) {
        filteredGeometries.sort();
      }
      const filteredGeometriesStr = JSON.stringify(filteredGeometries);
      Logger.log("FILTERED_GEOM:", filteredGeometriesStr);
    }
    updateFilter();
  }, [filteredGeometries, layerCreated]);

  // Rerender when map changed.
  useEffect(() => {
    createLayer();
  }, [map]);

  // Rerender when map changed.
  useEffect(() => {
    if (map) {
      if (indicatorShow) {
        createLayer();
        deckGLLayer();
      } else {
        setReferenceLayerConfig({});
        removeAllLayers();
      }
    }
  }, [indicatorShow]);

  // When 3DView changed
  useEffect(() => {
    deckGLLayer();
  }, [is3DView]);

  /**
   * Remove all layer
   */
  const removeAllLayers = () => {
    removeLayer(map, FILL_LAYER_ID);
    removeLayer(map, OUTLINE_LAYER_ID);
    removeSource(map, REFERENCE_LAYER_ID);
    deckGLLayer();
  };
  /***
   * CREATE LAYER
   */
  const createLayer = () => {
    if (!indicatorShow) {
      return;
    }
    const vectorTiles = referenceLayerData?.data?.vector_tiles;

    // No vector tile
    if (referenceLayerData?.data && !referenceLayerData?.data?.vector_tiles) {
      removeAllLayers();
      return;
    }
    if (vectorTiles && levels && map && currentLevel !== undefined) {
      const url = GeorepoUrls.WithoutDomain(updateToken(vectorTiles));
      const _referenceLayerConfig = {
        tiles: [url],
        "source-layer": "Level-" + currentLevel,
      };
      // If the config is same, skip it
      if (
        JSON.stringify(_referenceLayerConfig) ===
        JSON.stringify(referenceLayerConfig)
      ) {
        return;
      }
      setReferenceLayerConfig({ ..._referenceLayerConfig });

      const source = {
        ..._referenceLayerConfig,
        type: "vector" as const,
        maxzoom: 8,
      };
      removeAllLayers();
      map.addSource(REFERENCE_LAYER_ID, source);

      // Fill layer
      const contextLayerIds = map
        .getStyle()
        .layers.filter(
          (layer) =>
            layer.id.includes(CONTEXT_LAYER_ID) ||
            layer.id.includes("gl-draw-") ||
            [INDICATOR_LABEL_ID, LAYER_HIGHLIGHT_ID].includes(layer.id),
        );
      let before = contextLayerIds[0]?.id;
      addLayerWithOrder(
        map,
        {
          id: OUTLINE_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: "line",
          "source-layer": _referenceLayerConfig["source-layer"],
          paint: {
            "line-color": defaultColor.outlineColor,
            "line-offset": 1,
            "line-width": defaultColor.outlineSize,
            "line-opacity": transparency,
          },
        },
        Variables.LAYER_CATEGORY.INDICATOR,
        before,
      );
      addLayerWithOrder(
        map,
        {
          id: FILL_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: "fill",
          "source-layer": _referenceLayerConfig["source-layer"],
          paint: {
            "fill-color": defaultColor.fillColor,
            "fill-opacity": transparency,
          },
        },
        Variables.LAYER_CATEGORY.INDICATOR,
        OUTLINE_LAYER_ID,
      );
      updateStyle();
      updateFilter();
      setLayerCreated(true);
    }
  };

  /***
   * Check codes of geometries
   */
  const checkCodes = () => {
    if (isReady()) {
      return filteredGeometries;
    }
    return null;
  };

  /***
   * UPDATE FILTER OF LAYER
   */
  const updateFilter = () => {
    if (isReady()) {
      const codes = checkCodes();
      if (codes) {
        map.setFilter(FILL_LAYER_ID, [
          "in",
          geomFieldOnVectorTile,
          ...codes,
        ] as FilterSpecification);
        map.setFilter(OUTLINE_LAYER_ID, [
          "in",
          geomFieldOnVectorTile,
          ...codes,
        ] as FilterSpecification);
      } else {
        map.setFilter(FILL_LAYER_ID, null);
        map.setFilter(OUTLINE_LAYER_ID, null);
      }
      deckGLLayer();

      let config = returnLayerStyleConfig(
        firstLayer,
        indicators,
      ) as IndicatorLayerConfig;
      if (
        dynamicStyleTypes.includes(config.style_type) &&
        config?.style_config?.sync_filter
      ) {
        updateStyle();
      }
    }
  };
  /***
   * UPDATE STYLE LAYER
   */
  const updateStyle = () => {
    // Filter geometry_code based on indicators layer
    // Also filter by levels that found on indicators
    if (isReady()) {
      // Get style for no data style
      let noDataStyle = returnNoDataStyle(firstLayer, indicators);
      if (!noDataStyle) {
        noDataStyle = {
          color: preferences.style_no_data_outline_color,
          outline_color: preferences.style_no_data_fill_color,
          outline_size: preferences.style_no_data_outline_size,
        };
      }
      if (noDataStyle.outline_size) {
        noDataStyle.outline_size = parseFloat(noDataStyle.outline_size);
      }

      let noDataStyleSecondLayer = returnNoDataStyle(secondLayer, indicators);
      if (!noDataStyleSecondLayer) {
        noDataStyleSecondLayer = {
          color: preferences.style_no_data_outline_color,
          outline_color: preferences.style_no_data_fill_color,
          outline_size: preferences.style_no_data_outline_size,
        };
      }
      if (noDataStyleSecondLayer.outline_size) {
        noDataStyleSecondLayer.outline_size = parseFloat(
          noDataStyleSecondLayer.outline_size,
        );
      }
      // Get indicator data per geom
      // This is needed for popup and rendering
      const indicatorValueByGeometry: IndicatorValues =
        getIndicatorValueByGeometry(
          firstLayer,
          indicators,
          indicatorsData,
          relatedTables,
          relatedTableData,
          selectedGlobalTime,
          geoField,
          filteredGeometries,
          referenceLayerProject,
          currentLevel,
          indicatorLayersData,
        );
      dispatch(Actions.MapGeometryValue.update(indicatorValueByGeometry));
      if (IS_DEBUG) {
        const geoms = Object.keys(indicatorValueByGeometry);
        geoms.sort();
        Logger.log("VALUED_GEOM:", geoms);
        Logger.log("LAYER_STYLE:", JSON.stringify(firstLayer?.style));
      }
      let indicatorSecondValueByGeometry = {};

      // Create colors
      const hideAndGeom: string[] = [];
      const fillColorsAndGeom: Record<string, string[]> = {};
      const outlineColorsAndGeom: Record<string, string[]> = {};
      const outlineSizesAndGeom: Record<string, string[]> = {};
      if (!compareMode) {
        // If not compare mode
        // Fill and color is from first indicator
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          {
            const style = returnStyle(firstLayer, value, noDataStyle);
            if (style?.hide) {
              hideAndGeom.push(key);
            }

            {
              // Check fill color
              const color = style?.color;
              if (color) {
                if (!fillColorsAndGeom[color]) {
                  fillColorsAndGeom[color] = [];
                }
                fillColorsAndGeom[color].push(key);
              }
            }
            {
              // Check outline color
              const color = style?.outline_color;
              if (color) {
                if (!outlineColorsAndGeom[color]) {
                  outlineColorsAndGeom[color] = [];
                }
                outlineColorsAndGeom[color].push(key);
              }
            }
            {
              // Check outline size
              const size = style?.outline_size;
              if (!isNaN(size) && parseFloat(size)) {
                if (!outlineSizesAndGeom[size]) {
                  outlineSizesAndGeom[size] = [];
                }
                outlineSizesAndGeom[size].push(key);
              }
            }
          }
        }
      } else {
        indicatorSecondValueByGeometry = getIndicatorValueByGeometry(
          secondLayer,
          indicators,
          indicatorsData,
          relatedTables,
          relatedTableData,
          selectedGlobalTime,
          geoField,
          filteredGeometries,
          referenceLayerProject,
          currentLevel,
          indicatorLayersData,
        );
        // If compare mode
        // Outline is first indicator color
        // Fill is second color
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          // Check outline color
          {
            const style = returnStyle(firstLayer, value, noDataStyle);
            const color = style?.color;
            if (color) {
              if (!outlineColorsAndGeom[color]) {
                outlineColorsAndGeom[color] = [];
              }
              outlineColorsAndGeom[color].push(key);
              if (!outlineSizesAndGeom[compareOutlineSize]) {
                outlineSizesAndGeom[compareOutlineSize] = [];
              }
              outlineSizesAndGeom[compareOutlineSize].push(key);
            }
          }
        }
        for (const [key, value] of Object.entries(
          indicatorSecondValueByGeometry,
        )) {
          // Check fill color
          {
            const style = returnStyle(
              secondLayer,
              value,
              noDataStyleSecondLayer,
            );
            const color = style?.color;
            if (color) {
              if (!fillColorsAndGeom[color]) {
                fillColorsAndGeom[color] = [];
              }
              fillColorsAndGeom[color].push(key);
            }
          }
        }
      }

      // Change colors
      {
        // FILL
        const cases: any[] = [];
        for (const [color, codes] of Object.entries(fillColorsAndGeom)) {
          cases.push([
            "in",
            ["get", geomFieldOnVectorTile],
            ["literal", codes],
          ]);
          cases.push(color);
        }
        if (cases.length) {
          const paintFilters = (["case"] as any[])
            .concat(cases)
            .concat(noDataStyle.color);
          map.setPaintProperty(FILL_LAYER_ID, "fill-color", paintFilters);
        } else {
          map.setPaintProperty(FILL_LAYER_ID, "fill-color", noDataStyle.color);
        }

        // Hide non valued one
        if (hideAndGeom.length) {
          map.setPaintProperty(FILL_LAYER_ID, "fill-opacity", [
            "case",
            ["in", ["get", geomFieldOnVectorTile], ["literal", hideAndGeom]],
            0,
            transparency,
          ]);
        } else {
          map.setPaintProperty(FILL_LAYER_ID, "fill-opacity", transparency);
        }
      }
      {
        // OUTLINE
        const cases: any[] = [];
        for (const [color, codes] of Object.entries(outlineColorsAndGeom)) {
          cases.push([
            "in",
            ["get", geomFieldOnVectorTile],
            ["literal", codes],
          ]);
          cases.push(color);
        }
        if (cases.length) {
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-color",
            (["case"] as any[]).concat(cases).concat(noDataStyle.outline_color),
          );
          map.setPaintProperty(
            FILL_LAYER_ID,
            "fill-outline-color",
            (["case"] as any[]).concat(cases).concat(noDataStyle.outline_color),
          );
        } else {
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-color",
            noDataStyle.outline_color,
          );
          map.setPaintProperty(
            FILL_LAYER_ID,
            "fill-outline-color",
            noDataStyle.outline_color,
          );
        }

        // Hide non valued one
        if (hideAndGeom.length) {
          map.setPaintProperty(OUTLINE_LAYER_ID, "line-opacity", [
            "case",
            ["in", ["get", geomFieldOnVectorTile], ["literal", hideAndGeom]],
            0,
            transparency,
          ]);
        } else {
          map.setPaintProperty(OUTLINE_LAYER_ID, "line-opacity", transparency);
        }
      }
      {
        // OUTLINE SIZE
        const sizes: any[] = [];
        const offset: any[] = [];
        for (const [size, codes] of Object.entries(outlineSizesAndGeom)) {
          sizes.push([
            "in",
            ["get", geomFieldOnVectorTile],
            ["literal", codes],
          ]);
          sizes.push(parseFloat(size));
          offset.push([
            "in",
            ["get", geomFieldOnVectorTile],
            ["literal", codes],
          ]);
          offset.push(parseFloat(size) / 2);
        }
        const defaultOutlineSize = compareMode
          ? 0.5
          : noDataStyle.outline_size
            ? noDataStyle.outline_size
            : 0.5;
        if (sizes.length) {
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-width",
            (["case"] as any[]).concat(sizes).concat(defaultOutlineSize),
          );
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-offset",
            (["case"] as any[]).concat(offset).concat(defaultOutlineSize / 2),
          );
        } else {
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-width",
            defaultOutlineSize,
          );
          map.setPaintProperty(
            OUTLINE_LAYER_ID,
            "line-offset",
            defaultOutlineSize / 2,
          );
        }
      }

      /*** Create popup */
      popup(
        map,
        FILL_LAYER_ID,
        indicators,
        indicatorsData,
        relatedTables,
        relatedTableData,
        indicatorLayers,
        firstLayer,
        secondLayer,
        indicatorValueByGeometry,
        indicatorSecondValueByGeometry,
        compareMode,
        geomFieldOnVectorTile,
        selectedGlobalTimeConfig,
        selectedGlobalTime,
        referenceLayerData,
      );

      // Create deck gl
      deckGLLayer(dictDeepCopy(indicatorValueByGeometry));

      // Log layers
      Logger.layers(map);
    }
  };

  /*** ------------------------------------- ***/
  /*** -------------- DECK.GL -------------- ***/
  /*** ------------------------------------- ***/
  /** Elevation time changed */
  const deckGlElevationTimeChanged = (
    timeoutDeckGlAnimationDate: number,
    url: string,
    currentLevel: number,
  ) => {
    if (deckGlElevationTime.current < 100) {
      setTimeout(function () {
        if (deckGlAnimationDate.current === timeoutDeckGlAnimationDate) {
          let newElevationTime = deckGlElevationTime.current + 5;
          if (newElevationTime > 100) {
            newElevationTime = 100;
          }
          deckGlElevationTime.current = newElevationTime;
          deckGlElevationTimeChanged(
            timeoutDeckGlAnimationDate,
            url,
            currentLevel,
          );
          deckGLLayerRender(url, currentLevel);
        }
      }, 70);
    }
  };

  /** Create deckGlLayer */
  const deckGLLayer = (
    indicatorValueByGeometry: IndicatorValues | null = null,
  ) => {
    if (!deckgl || (!is3DView && !is3DInit)) {
      deckGlData.current = {};
      return;
    }
    setIs3DInit(true);
    const geometries = checkCodes();
    let url = null;
    const vectorTiles = referenceLayerData?.data?.vector_tiles;
    if (vectorTiles && levels && map && currentLevel !== undefined) {
      url = GeorepoUrls.WithoutDomain(updateToken(vectorTiles));
    }
    if (!url) {
      return;
    }

    // Get indicator data per geom
    // This is needed for popup and rendering
    if (!indicatorValueByGeometry) {
      indicatorValueByGeometry = getIndicatorValueByGeometry(
        firstLayer,
        indicators,
        indicatorsData,
        relatedTables,
        relatedTableData,
        selectedGlobalTime,
        geoField,
        filteredGeometries,
        referenceLayerProject,
        currentLevel,
        indicatorLayersData,
      );
    }
    if (firstLayer.indicators?.length > 1) {
      indicatorValueByGeometry = {} as IndicatorValues;
    }

    let max = 0;
    let min = null;
    let maxElevation = MAX_ELEVATION;
    const bbox = referenceLayerData?.data?.bbox;
    if (bbox) {
      const height = Math.sqrt(turfArea(bboxPolygon(bbox)));
      if (height < MAX_ELEVATION) {
        maxElevation = height;
      }
    }
    for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
      if (value[0].admin_level === currentLevel) {
        if (value[0].value > max) {
          max = value[0].value;
        }
        if (min === null || value[0].value < min) {
          min = value[0].value;
        }
      }
    }
    if (max === min) {
      min = 0;
    }

    let noDataStyle = returnNoDataStyle(firstLayer, indicators);
    if (!noDataStyle) {
      noDataStyle = {
        color: preferences.style_no_data_outline_color,
        outline_color: preferences.style_no_data_fill_color,
        outline_size: preferences.style_no_data_outline_size,
      };
    }

    // Calculate style data
    const newDeckGl: Record<string, DeckGlFeatureData | null> = {};
    for (const [geom_id, indicatorValue] of Object.entries(
      indicatorValueByGeometry,
    )) {
      const value = indicatorValue[0]?.value;
      if (![null, undefined].includes(value)) {
        const style = returnStyle(firstLayer, indicatorValue, noDataStyle);
        if ((geometries && !geometries.includes(geom_id)) || !style?.color) {
          newDeckGl[geom_id] = null;
        } else {
          newDeckGl[geom_id] = {
            elevation: is3DView
              ? Math.floor(((value - min) / max) * maxElevation)
              : 0,
            fillColor: style.color,
            currElevation: deckGlData.current[geom_id]?.currElevation,
          };
        }
      }
    }
    deckGlData.current = newDeckGl;
    deckGlElevationTime.current = 0;
    deckGlAnimationDate.current = new Date().getTime();
    deckGlElevationTimeChanged(deckGlAnimationDate.current, url, currentLevel);
    deckGLLayerRender(url, currentLevel);
  };

  /** Render deckGlLayer */
  const deckGLLayerRender = (url: string, currentLevel: number) => {
    const isRender2DView = !is3DView && deckGlElevationTime.current === 100;
    const layer = new MVTLayer({
      data: url,
      minZoom: 0,
      maxZoom: 8,
      updateTriggers: {
        getFillColor: [
          deckGlData.current,
          deckGlElevationTime.current,
          is3DView,
          indicatorShow,
        ],
        getElevation: [
          deckGlData.current,
          deckGlElevationTime.current,
          is3DView,
          indicatorShow,
        ],
      },
      getFillColor: (feature: Feature) => {
        if (isRender2DView || !indicatorShow) {
          return [0, 0, 0, 0];
        }
        const geom_id = extractCode(feature.properties, geomFieldOnVectorTile);
        const data = deckGlData.current[geom_id];
        let alpha = 200;
        if (data) {
          if (data.fillColor === "#ffffff" && data.elevation === 0) {
            return [0, 0, 0, 0];
          }
          const currElevation = data.currElevation ? data.currElevation : 0;
          if (!is3DView) {
            if (!currElevation) {
              alpha = 0;
            } else if (deckGlElevationTime.current !== 100) {
              alpha = alpha * ((100 - deckGlElevationTime.current) / 100);
            }
            return hexToRGBList(data.fillColor, alpha);
          }
          return hexToRGBList(data.fillColor, alpha);
        }
        return [0, 0, 0, 0];
      },
      lineWidthMinPixels: 1,
      renderSubLayers: (props) => {
        return [new GeoJsonLayer(props)];
      },
      // props added by DataFilterExtension
      getFilterValue: (f: Feature) => f.properties?.level as number,
      filterRange: [currentLevel, currentLevel],
      extensions: [new DataFilterExtension()],
      extruded: true,
      getElevation: (feature: Feature) => {
        if (!indicatorShow) {
          return 0;
        }
        const geom_id = extractCode(feature.properties, geomFieldOnVectorTile);
        const data = deckGlData.current[geom_id];

        if (data) {
          const currElevation = data.currElevation ? data.currElevation : 0;
          data.currElevation =
            currElevation +
            ((data.elevation - currElevation) * deckGlElevationTime.current) /
              100;
          return data.currElevation;
        }
        return 0;
      },
    });

    // Update layers
    deckgl.setProps({ layers: [layer] });
  };

  return <></>;
}

export interface Props {
  map: maplibregl.Map;
  deckgl: MapboxOverlay;
  firstLayer: IndicatorLayer;
  secondLayer: IndicatorLayer;
}

export default function ReferenceLayers({
  map,
  deckgl,
  firstLayer,
  secondLayer,
}: Props) {
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  const firstLayerView = referenceLayerIndicatorLayer(
    referenceLayer,
    firstLayer,
  );
  const secondLayerView = referenceLayerIndicatorLayer(
    referenceLayer,
    secondLayer,
  );

  if (!map) {
    return;
  }
  return (
    <>
      <ReferenceLayer
        id={map.getContainer().id + "-0"}
        map={map}
        referenceLayer={firstLayerView}
        deckgl={deckgl}
        firstLayer={firstLayer}
        secondLayer={secondLayer}
      />
      <ReferenceLayer
        id={map.getContainer().id + "-1"}
        map={map}
        referenceLayer={secondLayerView}
        deckgl={deckgl}
        firstLayer={firstLayer}
        secondLayer={secondLayer}
      />
      <GeorepoAuthorizationModal />
    </>
  );
}
