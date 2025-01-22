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

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MVTLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { DataFilterExtension } from '@deck.gl/extensions';
import { area as turfArea, bboxPolygon, } from '@turf/turf';
import {
  extractCode,
  GeorepoUrls,
  updateToken
} from '../../../../../utils/georepo'
import { allDataIsReady } from "../../../../../utils/indicators";
import { returnStyle } from "../../../../../utils/referenceLayer";
import { dictDeepCopy, hexToRGBList } from '../../../../../utils/main'
import {
  getIndicatorValueByGeometry
} from '../../../../../utils/indicatorData'
import { hasLayer, removeLayer, removeSource } from "../../utils"
import { popup } from "./Popup";
import { getLayerData } from "../../../../../utils/indicatorLayer";
import {
  dynamicStyleTypes,
  returnLayerStyleConfig,
  returnNoDataStyle
} from "../../../../../utils/Style";
import GeorepoAuthorizationModal
  from "../../../../../components/GeorepoAuthorizationModal";
import { IS_DEBUG, Logger } from "../../../../../utils/logger";
import { Actions } from "../../../../../store/dashboard";

export const BEFORE_LAYER = 'gl-draw-polygon-fill-inactive.cold'
export const CONTEXT_LAYER_ID = `context-layer`
const MAX_ELEVATION = 500000

const NOCOLOR = `rgba(0, 0, 0, 0)`
const INDICATOR_LABEL_ID = 'indicator-label'
const LAYER_HIGHLIGHT_ID = 'reference-layer-highlight'

// Layer keys
export const REFERENCE_LAYER_ID_KEY = `reference-layer`
export const FILL_LAYER_ID_KEY = REFERENCE_LAYER_ID_KEY + '-fill'
const OUTLINE_LAYER_ID_KEY = REFERENCE_LAYER_ID_KEY + '-outline'

const geo_field = 'concept_uuid'

// GLobal data
// To make data persist
let deckGlData = {}
let deckGlElevationTime = 0
let deckGlAnimationDate = null
let currentRenderDataString = ''
let currentIndicatorLayerStringData = ''
let currentIndicatorSecondLayerStringData = ''
let currentCompareMode = false

let prevCurrentLevel = null

/**
 * ReferenceLayer selector.
 */
export function ReferenceLayer(
  { idx, map, referenceLayer, deckgl, is3DView }
) {
  const dispatch = useDispatch()
  const REFERENCE_LAYER_ID = REFERENCE_LAYER_ID_KEY + '-' + idx
  const FILL_LAYER_ID = FILL_LAYER_ID_KEY + '-' + idx
  const OUTLINE_LAYER_ID = OUTLINE_LAYER_ID_KEY + '-' + idx

  const prevState = useRef()
  const {
    referenceLayer: referenceLayerProject,
    indicatorLayers,
    indicators,
    relatedTables,
    geoField
  } = useSelector(state => state.dashboard.data);
  const { indicatorShow } = useSelector(state => state.map);
  const { compareMode } = useSelector(state => state.mapMode)
  const referenceLayerData = useSelector(state => state.referenceLayerData[referenceLayer?.identifier]);
  const indicatorsData = useSelector(state => state.indicatorsData);
  const relatedTableData = useSelector(state => state.relatedTableData);
  const filteredGeometries = useSelector(state => state.filteredGeometries);
  const currentIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const currentIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedGlobalTimeConfig = useSelector(state => state.selectedGlobalTimeConfig);

  const [is3DInit, setIs3DInit] = useState(false);
  const [layerCreated, setLayerCreated] = useState(false);
  const [referenceLayerConfig, setReferenceLayerConfig] = useState({});

  const geomFieldOnVectorTile = geoField === 'geometry_code' ? 'ucode' : geoField
  const compareOutlineSize = preferences.style_compare_mode_outline_size

  const isReady = () => {
    return map && hasLayer(map, FILL_LAYER_ID) && hasLayer(map, OUTLINE_LAYER_ID)
  }

  let levels = referenceLayerData?.data?.dataset_levels
  let currentLevel = selectedAdminLevel ? selectedAdminLevel.level : levels?.level

  // When indicator data, current layer, second layer and compare mode changed
  // Update the style
  useEffect(() => {
    const data = getLayerData(indicatorsData, relatedTableData, currentIndicatorLayer, referenceLayerProject).concat(
      getLayerData(indicatorsData, relatedTableData, currentIndicatorSecondLayer, referenceLayerProject)
    )
    if (allDataIsReady(data)) {
      const dataInString = JSON.stringify(data)
      const currentIndicatorLayerString = JSON.stringify(currentIndicatorLayer)
      const currentIndicatorSecondLayerString = JSON.stringify(currentIndicatorSecondLayer)
      if (
        currentRenderDataString !== dataInString ||
        currentIndicatorLayerStringData !== currentIndicatorLayerString ||
        currentIndicatorSecondLayerStringData !== currentIndicatorSecondLayerString ||
        currentCompareMode !== compareMode ||
        currentLevel !== prevCurrentLevel
      ) {
        updateStyle()
        currentRenderDataString = dataInString
        currentIndicatorLayerStringData = currentIndicatorLayerString
        currentIndicatorSecondLayerStringData = currentIndicatorSecondLayerString
        currentCompareMode = compareMode
        prevCurrentLevel = currentLevel
      }
    }
  }, [
    indicatorsData, currentIndicatorLayer,
    currentIndicatorSecondLayer, compareMode,
    layerCreated, relatedTableData, geoField, currentLevel
  ]);

  // When reference layer, it's data, admin and show/hide changed.
  // Change the source
  useEffect(() => {
    if (referenceLayerData) {
      createLayer()
    } else {
      setReferenceLayerConfig({})
      removeAllLayers()
    }
  }, [referenceLayer, referenceLayerData, selectedAdminLevel]);


  // Rerender if filter changed.
  useEffect(() => {
    updateFilter()
  }, [filteredGeometries, layerCreated]);

  // Rerender when map changed.
  useEffect(() => {
    createLayer()
  }, [map]);

  // Rerender when map changed.
  useEffect(() => {
    if (map) {
      if (indicatorShow) {
        createLayer()
        deckGLLayer()
      } else {
        setReferenceLayerConfig({})
        removeAllLayers()
      }
    }
  }, [indicatorShow]);

  // When 3DView changed
  useEffect(() => {
    deckGLLayer()

  }, [is3DView]);

  /**
   * Remove all layer
   */
  const removeAllLayers = () => {
    removeLayer(map, FILL_LAYER_ID)
    removeLayer(map, OUTLINE_LAYER_ID)
    removeSource(map, REFERENCE_LAYER_ID)
    deckGLLayer()
  }
  /***
   * CREATE LAYER
   */
  const createLayer = () => {
    if (!indicatorShow) {
      return;
    }
    const vectorTiles = referenceLayerData?.data?.vector_tiles
    if (vectorTiles && levels && map && currentLevel !== undefined) {
      const url = GeorepoUrls.WithoutDomain(updateToken(vectorTiles))
      const _referenceLayerConfig = {
        tiles: [url],
        "source-layer": 'Level-' + currentLevel
      }
      // If the config is same, skip it
      if (JSON.stringify(_referenceLayerConfig) === JSON.stringify(referenceLayerConfig)) {
        return
      }
      setReferenceLayerConfig({ ..._referenceLayerConfig })

      const source = {
        ..._referenceLayerConfig,
        type: 'vector',
        maxzoom: 8,
      }
      removeAllLayers()
      map.addSource(REFERENCE_LAYER_ID, source);

      // Fill layer
      const contextLayerIds = map.getStyle().layers.filter(
        layer => layer.type !== 'raster'
      ).filter(
        layer => layer.id.includes(CONTEXT_LAYER_ID) || layer.id === BEFORE_LAYER
      )
      let before = contextLayerIds[0]?.id
      if (hasLayer(map, INDICATOR_LABEL_ID)) {
        before = INDICATOR_LABEL_ID
      }

      // Before highlight
      if (hasLayer(map, LAYER_HIGHLIGHT_ID)) {
        before = LAYER_HIGHLIGHT_ID
      }
      map.addLayer(
        {
          id: OUTLINE_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: 'line',
          "source-layer": _referenceLayerConfig["source-layer"],
          paint: {
            'line-color': NOCOLOR,
            'line-offset': 1,
            'line-width': 1,
          }
        },
        before
      )
      map.addLayer(
        {
          id: FILL_LAYER_ID,
          source: REFERENCE_LAYER_ID,
          type: 'fill',
          "source-layer": _referenceLayerConfig["source-layer"],
          paint: {
            'fill-color': NOCOLOR,
            'fill-outline-color': NOCOLOR
          }
        },
        OUTLINE_LAYER_ID
      )
      updateStyle()
      updateFilter()
      setLayerCreated(true)
    }
  }

  /***
   * Check codes of geometries
   */
  const checkCodes = () => {
    if (isReady()) {
      return filteredGeometries
    }
    return null
  }

  /***
   * UPDATE FILTER OF LAYER
   */
  const updateFilter = () => {
    if (isReady()) {
      const codes = checkCodes()
      if (codes) {
        map.setFilter(FILL_LAYER_ID, ['in', geo_field].concat(codes));
        map.setFilter(OUTLINE_LAYER_ID, ['in', geo_field].concat(codes));
      } else {
        map.setFilter(FILL_LAYER_ID, null);
        map.setFilter(OUTLINE_LAYER_ID, null);
      }
      deckGLLayer()

      let config = returnLayerStyleConfig(currentIndicatorLayer, indicators)
      if (dynamicStyleTypes.includes(config.style_type) && config?.style_config?.sync_filter) {
        updateStyle()
      }
    }
  }
  /***
   * UPDATE STYLE LAYER
   */
  const updateStyle = () => {
    // Filter geometry_code based on indicators layer
    // Also filter by levels that found on indicators
    if (isReady()) {
      // Get style for no data style
      let noDataStyle = returnNoDataStyle(
        currentIndicatorLayer, indicators
      )
      if (!noDataStyle) {
        noDataStyle = {
          color: preferences.style_no_data_outline_color,
          outline_color: preferences.style_no_data_fill_color,
          outline_size: preferences.style_no_data_outline_size
        }
      }
      if (noDataStyle.outline_size) {
        noDataStyle.outline_size = parseFloat(noDataStyle.outline_size)
      }

      let noDataStyleSecondLayer = returnNoDataStyle(
        currentIndicatorSecondLayer, indicators
      )
      if (!noDataStyleSecondLayer) {
        noDataStyleSecondLayer = {
          color: preferences.style_no_data_outline_color,
          outline_color: preferences.style_no_data_fill_color,
          outline_size: preferences.style_no_data_outline_size
        }
      }
      if (noDataStyleSecondLayer.outline_size) {
        noDataStyleSecondLayer.outline_size = parseFloat(noDataStyleSecondLayer.outline_size)
      }

      // Get indicator data per geom
      // This is needed for popup and rendering
      const indicatorValueByGeometry = getIndicatorValueByGeometry(
        currentIndicatorLayer, indicators, indicatorsData,
        relatedTables, relatedTableData, selectedGlobalTime,
        geoField, filteredGeometries, referenceLayerProject, currentLevel
      )
      dispatch(Actions.MapGeometryValue.update(indicatorValueByGeometry))
      if (IS_DEBUG) {
        const geoms = Object.keys(indicatorValueByGeometry)
        geoms.sort()
        Logger.log('VALUED_GEOM:', geoms)
      }
      let indicatorSecondValueByGeometry = {}

      // Create colors
      const hideAndGeom = []
      const fillColorsAndGeom = {}
      const outlineColorsAndGeom = {}
      const outlineSizesAndGeom = {}
      if (!compareMode) {
        // If not compare mode
        // Fill and color is from first indicator
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          {
            const style = returnStyle(currentIndicatorLayer, value, noDataStyle)
            if (style?.hide) {
              hideAndGeom.push(key)
            }

            {
              // Check fill color
              const color = style?.color
              if (color) {
                if (!fillColorsAndGeom[color]) {
                  fillColorsAndGeom[color] = []
                }
                fillColorsAndGeom[color].push(key)
              }
            }
            {
              // Check outline color
              const color = style?.outline_color
              if (color) {
                if (!outlineColorsAndGeom[color]) {
                  outlineColorsAndGeom[color] = []
                }
                outlineColorsAndGeom[color].push(key)
              }
            }
            {
              // Check outline size
              const size = style?.outline_size
              if (!isNaN(size) && parseFloat(size)) {
                if (!outlineSizesAndGeom[size]) {
                  outlineSizesAndGeom[size] = []
                }
                outlineSizesAndGeom[size].push(key)
              }
            }
          }
        }
      } else {
        indicatorSecondValueByGeometry = getIndicatorValueByGeometry(
          currentIndicatorSecondLayer, indicators, indicatorsData,
          relatedTables, relatedTableData, selectedGlobalTime,
          geoField, filteredGeometries, referenceLayerProject, currentLevel
        )
        // If compare mode
        // Outline is first indicator color
        // Fill is second color
        for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
          // Check outline color
          {
            const style = returnStyle(
              currentIndicatorLayer, value, noDataStyle
            )
            const color = style?.color
            if (color) {
              if (!outlineColorsAndGeom[color]) {
                outlineColorsAndGeom[color] = []
              }
              outlineColorsAndGeom[color].push(key)
              if (!outlineSizesAndGeom[compareOutlineSize]) {
                outlineSizesAndGeom[compareOutlineSize] = []
              }
              outlineSizesAndGeom[compareOutlineSize].push(key)
            }
          }
        }
        for (const [key, value] of Object.entries(indicatorSecondValueByGeometry)) {
          // Check fill color
          {
            const style = returnStyle(currentIndicatorSecondLayer, value, noDataStyleSecondLayer)
            const color = style?.color
            if (color) {
              if (!fillColorsAndGeom[color]) {
                fillColorsAndGeom[color] = []
              }
              fillColorsAndGeom[color].push(key)
            }
          }
        }
      }

      // Change colors
      {
        // FILL
        const cases = []
        for (const [color, codes] of Object.entries(fillColorsAndGeom)) {
          cases.push(
            ["in", ["get", geomFieldOnVectorTile], ["literal", codes]]
          )
          cases.push(color)
        }
        if (cases.length) {
          const paintFilters = ["case"].concat(cases).concat(noDataStyle.color)
          map.setPaintProperty(FILL_LAYER_ID, 'fill-color', paintFilters);
        } else {
          map.setPaintProperty(FILL_LAYER_ID, 'fill-color', noDataStyle.color);
        }

        // Hide non valued one
        if (hideAndGeom.length) {
          map.setPaintProperty(FILL_LAYER_ID, 'fill-opacity', [
              "case",
              ["in", ["get", geomFieldOnVectorTile], ["literal", hideAndGeom]],
              0,
              1
            ]
          );
        } else {
          map.setPaintProperty(FILL_LAYER_ID, 'fill-opacity', 1);
        }
      }
      {
        // OUTLINE
        const cases = []
        for (const [color, codes] of Object.entries(outlineColorsAndGeom)) {
          cases.push(
            ["in", ["get", geomFieldOnVectorTile], ["literal", codes]]
          )
          cases.push(color)
        }
        if (cases.length) {
          map.setPaintProperty(
            OUTLINE_LAYER_ID, 'line-color',
            ["case"].concat(cases).concat(noDataStyle.outline_color)
          );
          map.setPaintProperty(
            FILL_LAYER_ID, 'fill-outline-color',
            ["case"].concat(cases).concat(noDataStyle.outline_color)
          );
        } else {
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-color', noDataStyle.outline_color);
          map.setPaintProperty(FILL_LAYER_ID, 'fill-outline-color', noDataStyle.outline_color);
        }

        // Hide non valued one
        if (hideAndGeom.length) {
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-opacity', [
              "case",
              ["in", ["get", geomFieldOnVectorTile], ["literal", hideAndGeom]],
              0,
              1
            ]
          );
        } else {
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-opacity', 1);
        }
      }
      {
        // OUTLINE SIZE
        const sizes = []
        const offset = []
        for (const [size, codes] of Object.entries(outlineSizesAndGeom)) {
          sizes.push(
            ["in", ["get", geomFieldOnVectorTile], ["literal", codes]]
          )
          sizes.push(parseFloat(size))
          offset.push(
            ["in", ["get", geomFieldOnVectorTile], ["literal", codes]]
          )
          offset.push(parseFloat(size) / 2)
        }
        const defaultOutlineSize = compareMode ? 0.5 : noDataStyle.outline_size ? noDataStyle.outline_size : 0.5
        if (sizes.length) {
          map.setPaintProperty(
            OUTLINE_LAYER_ID, 'line-width',
            ["case"].concat(sizes).concat(defaultOutlineSize)
          );
          map.setPaintProperty(
            OUTLINE_LAYER_ID, 'line-offset',
            ["case"].concat(offset).concat(defaultOutlineSize / 2)
          );
        } else {
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-width', defaultOutlineSize);
          map.setPaintProperty(OUTLINE_LAYER_ID, 'line-offset', defaultOutlineSize / 2);
        }
      }

      /*** Create popup */
      popup(
        map, FILL_LAYER_ID, indicators, indicatorsData,
        relatedTables, relatedTableData,
        indicatorLayers, currentIndicatorLayer, currentIndicatorSecondLayer,
        indicatorValueByGeometry, indicatorSecondValueByGeometry,
        compareMode, geomFieldOnVectorTile,
        selectedGlobalTimeConfig,
        selectedGlobalTime, referenceLayerData
      )

      // Create deck gl
      deckGLLayer(dictDeepCopy(indicatorValueByGeometry))
    }
  }

  /*** ------------------------------------- ***/
  /*** -------------- DECK.GL -------------- ***/
  /*** ------------------------------------- ***/
  /** Elevation time changed */
  const deckGlElevationTimeChanged = (timeoutDeckGlAnimationDate, url, currentLevel) => {
    if (deckGlElevationTime < 100) {
      setTimeout(function () {
        if (deckGlAnimationDate === timeoutDeckGlAnimationDate) {
          let newElevationTime = deckGlElevationTime + 5
          if (newElevationTime > 100) {
            newElevationTime = 100
          }
          deckGlElevationTime = newElevationTime
          deckGlElevationTimeChanged(timeoutDeckGlAnimationDate, url, currentLevel)
          deckGLLayerRender(url, currentLevel)
        }
      }, 70);
    }
  }

  /** Create deckGlLayer */
  const deckGLLayer = (indicatorValueByGeometry) => {
    if (!deckgl || (!is3DView && !is3DInit)) {
      deckGlData = {}
      return;
    }
    setIs3DInit(true)
    const geometries = checkCodes()
    let url = null
    const vectorTiles = referenceLayerData?.data?.vector_tiles
    if (vectorTiles && levels && map && currentLevel !== undefined) {
      url = GeorepoUrls.WithoutDomain(updateToken(vectorTiles))
    }
    if (!url) {
      return
    }

    // Get indicator data per geom
    // This is needed for popup and rendering
    if (!indicatorValueByGeometry) {
      indicatorValueByGeometry = getIndicatorValueByGeometry(
        currentIndicatorLayer, indicators, indicatorsData,
        relatedTables, relatedTableData, selectedGlobalTime,
        geoField, filteredGeometries, referenceLayerProject, currentLevel
      )
    }
    if (currentIndicatorLayer.indicators?.length > 1) {
      indicatorValueByGeometry = {}
    }

    let max = 0
    let min = null
    let maxElevation = MAX_ELEVATION
    const bbox = referenceLayerData?.data?.bbox
    if (bbox) {
      const height = Math.sqrt(turfArea(bboxPolygon(bbox)))
      if (height < MAX_ELEVATION) {
        maxElevation = height
      }
    }
    for (const [key, value] of Object.entries(indicatorValueByGeometry)) {
      if (value[0].admin_level === currentLevel) {
        if (value[0].value > max) {
          max = value[0].value
        }
        if (min === null || value[0].value < min) {
          min = value[0].value
        }
      }
    }
    if (max === min) {
      min = 0
    }

    let noDataStyle = returnNoDataStyle(currentIndicatorLayer, indicators)
    if (!noDataStyle) {
      noDataStyle = {
        color: preferences.style_no_data_outline_color,
        outline_color: preferences.style_no_data_fill_color,
        outline_size: preferences.style_no_data_outline_size
      }
    }

    // Calculate style data
    const newDeckGl = {}
    for (const [geom_id, indicatorValue] of Object.entries(indicatorValueByGeometry)) {
      const value = indicatorValue[0]?.value
      if (![null, undefined].includes(value)) {
        const style = returnStyle(
          currentIndicatorLayer, indicatorValue, noDataStyle
        )
        if (geometries && !geometries.includes(geom_id) || !style?.color) {
          newDeckGl[geom_id] = null
        } else {
          newDeckGl[geom_id] = {
            elevation: is3DView ? Math.floor(((value - min) / max) * maxElevation) : 0,
            fillColor: style.color,
            currElevation: deckGlData[geom_id]?.currElevation
          }
        }
      }
    }
    deckGlData = newDeckGl
    deckGlElevationTime = 0
    deckGlAnimationDate = new Date().getTime()
    deckGlElevationTimeChanged(deckGlAnimationDate, url, currentLevel)
    deckGLLayerRender(url, currentLevel)
  }

  /** Render deckGlLayer */
  const deckGLLayerRender = (url, currentLevel) => {
    const isRender2DView = !is3DView && deckGlElevationTime === 100
    const layer = new MVTLayer({
      data: url,
      minZoom: 0,
      maxZoom: 8,
      updateTriggers: {
        getFillColor: [deckGlData, deckGlElevationTime, is3DView, indicatorShow],
        getElevation: [deckGlData, deckGlElevationTime, is3DView, indicatorShow],
      },
      getFillColor: feature => {
        if (isRender2DView || !indicatorShow) {
          return [0, 0, 0, 0]
        }
        const geom_id = extractCode(feature.properties, geomFieldOnVectorTile)
        const data = deckGlData[geom_id]
        let alpha = 200
        if (data) {
          if (data.fillColor === '#ffffff' && data.elevation === 0) {
            return [0, 0, 0, 0]
          }
          const currElevation = data.currElevation ? data.currElevation : 0
          if (!is3DView) {
            if (!currElevation) {
              alpha = 0
            } else if (deckGlElevationTime !== 100) {
              alpha = alpha * ((100 - deckGlElevationTime) / 100)
            }
            return hexToRGBList(data.fillColor, alpha)
          }
          return hexToRGBList(data.fillColor, alpha)
        }
        return [0, 0, 0, 0]
      },
      lineWidthMinPixels: 1,
      renderSubLayers: props => {
        return [
          new GeoJsonLayer(props)
        ]
      },
      // props added by DataFilterExtension
      getFilterValue: f => f.properties.level,
      filterRange: [currentLevel, currentLevel],
      extensions: [new DataFilterExtension()],
      extruded: true,
      getElevation: feature => {
        if (!indicatorShow) {
          return 0
        }
        const geom_id = extractCode(feature.properties, geomFieldOnVectorTile)
        const data = deckGlData[geom_id]

        if (data) {
          const currElevation = data.currElevation ? data.currElevation : 0
          data.currElevation = currElevation + ((data.elevation - currElevation) * deckGlElevationTime / 100)
          return data.currElevation
        }
        return 0
      }
    })

    // Update layers
    deckgl.setProps({ layers: [layer] })
  }


  return null
}

export default function ReferenceLayers({ map, deckgl, is3DView }) {
  const {
    referenceLayers
  } = useSelector(state => state.map);

  return map ? <>
    <ReferenceLayer
      idx={0} map={map}
      referenceLayer={referenceLayers[0]} deckgl={deckgl} is3DView={is3DView}
    />
    <ReferenceLayer
      idx={1} map={map}
      referenceLayer={referenceLayers[1]} deckgl={deckgl} is3DView={is3DView}
    />
    <GeorepoAuthorizationModal/>
  </> : null
}