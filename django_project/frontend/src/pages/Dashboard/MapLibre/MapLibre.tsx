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
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl, {
  LayerSpecification,
  SourceSpecification,
} from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox/typed";

import { Actions } from "../../../store/dashboard";
import { customDrawStyles } from "../../../utils/MaplibreDrawingTools/Styles";
import { removeLayer, removeSource } from "./utils";
import { addLayerWithOrder } from "./utils/Render";
import { Variables } from "../../../utils/Variables";
import {
  updateContextLayerTransparency,
  updateIndicatorLayerTransparency,
} from "./utils/trasnparency";
import { zoomToExtent } from "./utils/movement";
import { registerMap, unregisterMap } from "./utils/mapSync";
import ContextLayers from "./Layers/ContextLayers";

// Initialize cog
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

maplibregl.addProtocol("cog", cogProtocol);

const BASEMAP_ID = `basemap`;

/*** Make attribution call Attributions component instead */
const createAttributionControl = (
  options: maplibregl.AttributionControlOptions,
  dispatch: Function,
): maplibregl.AttributionControl => {
  const control = new maplibregl.AttributionControl(options);
  // @ts-ignore
  control._updateCompact = function () {
    if (this._map?.style) {
      const attributions: string[] = [];
      for (const [, layer] of Object.entries(this._map.style._layers) as any) {
        const source = this._map.style.sourceCaches[layer.source];
        if (source?._source?.attribution) {
          attributions.push(source._source.attribution);
        }
      }
      dispatch(
        Actions.GlobalState.update({
          attributions: Array.from(new Set(attributions)),
        }),
      );
    }
  };
  return control;
};

export interface Props {
  id: number;
  setParentMap?: (map: maplibregl.Map) => void;
  setParentDeckGl?: (deckgl: MapboxOverlay) => void;
  drawingRef?: React.MutableRefObject<any>;
}

export default function MapLibre({
  id,
  setParentMap,
  setParentDeckGl,
  drawingRef,
}: Props) {
  const [map, setMap] = useState(null);
  const [deckgl, setDeckGl] = useState(null);
  const dispatch = useDispatch();
  const container = "map-" + id;

  const {
    basemapLayer,
    position: mapPosition,
    transparency,
    extent: mapExtent,
  } = useSelector(
    // @ts-ignore
    (state) => state.map,
  );

  const { value: extent, triggeredBy: extentTriggeredBy } = mapExtent;
  const { value: position, triggeredBy: positionTriggeredBy } = mapPosition;

  // Get zoom configurations
  const dashboardExtent = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data.extent,
  );
  // @ts-ignore
  const minZoomConfig = useSelector((state) => state.dashboard.data.minZoom);
  // @ts-ignore
  const maxZoomConfig = useSelector((state) => state.dashboard.data.maxZoom);

  const {
    indicatorLayer: indicatorLayerTransparency,
    contextLayer: contextLayerTransparency,
  } = transparency;

  const indicatorTransparencyRef = useRef(indicatorLayerTransparency);
  const contextTransparencyRef = useRef(contextLayerTransparency);

  // Drawing ref
  const redrawMeasurement = () => drawingRef?.current.redrawMeasurement();
  const isMeasurementToolActive = () =>
    drawingRef?.current.isMeasurementToolActive();
  const redrawZonalAnalysis = () => drawingRef?.current.redrawZonalAnalysis();
  const isZonalAnalysisActive = () =>
    drawingRef?.current.isZonalAnalysisActive();

  /**
   * FIRST INITIATE
   * */
  useEffect(() => {
    const newMap = new maplibregl.Map({
      container: container,
      style: {
        version: 8,
        sources: {},
        layers: [],
        // @ts-ignore
        glyphs: staticUrl + "fonts/{fontstack}/{range}.pbf",
      },
      center: [0, 0],
      zoom: minZoomConfig > 1 ? minZoomConfig : 1,
      minZoom: minZoomConfig,
      maxZoom: maxZoomConfig,
      attributionControl: false,
    }).addControl(createAttributionControl({ compact: true }, dispatch));
    newMap.once("load", () => {
      setMap(newMap);
      registerMap(id, newMap);
      if (setParentMap) {
        setParentMap(newMap);
      }
      if (id === 0) {
        setTimeout(() => {
          document
            .querySelector(".maplibregl-ctrl-compass")
            ?.addEventListener("click", () => {
              newMap.easeTo({ pitch: 0, bearing: 0 });
            });
        }, 500);
      }
    });
    newMap.addControl(
      // @ts-ignore
      new MapboxDraw({
        displayControlsDefault: false,
        styles: customDrawStyles,
        controls: {
          polygon: true,
          line_string: true,
          trash: true,
        },
      }),
      "bottom-right",
    );
    if (id === 0) {
      newMap.addControl(new maplibregl.NavigationControl(), "bottom-left");
    }
    let previousLayerIds: string[] = [];
    newMap.on("styledata", () => {
      const currentIds = newMap.getStyle().layers.map((layer) => layer.id);
      if (JSON.stringify(currentIds) === JSON.stringify(previousLayerIds)) {
        return;
      }
      previousLayerIds = currentIds;
      const contextLayers = newMap
        .getStyle()
        .layers.filter((layer) => layer.id.includes("context-layer-"));
      const contextLayersExists = contextLayers.length > 0;
      const popupElements = document.querySelectorAll<HTMLElement>(
        `#${container} .maplibregl-popup-anchor-center`,
      );
      if (contextLayersExists) {
        popupElements.forEach((popup) => {
          popup.style.zIndex = "-9"; // Lower than your intended layer
        });
      } else {
        popupElements.forEach((popup) => {
          popup.style.zIndex = "0"; // Lower than your intended layer
        });
      }
      updateIndicatorLayerTransparency(
        newMap,
        indicatorTransparencyRef.current,
      );
      updateContextLayerTransparency(newMap, contextTransparencyRef.current);
    });

    if (id === 0) {
      const mapControl = document.querySelector(
        ".maplibregl-ctrl-bottom-left .maplibregl-ctrl-group",
      );
      const tilt = document.getElementsByClassName("TiltControl")[0];
      document.getElementById("maplibregl-ctrl-bottom-left")?.appendChild(mapControl);
      document.getElementById("tilt-control")?.appendChild(tilt);
    }

    const deckgl = new MapboxOverlay({
      interleaved: true,
      layers: [],
    });
    newMap.addControl(deckgl as unknown as maplibregl.IControl);
    setDeckGl(deckgl);
    if (setParentDeckGl) {
      setParentDeckGl(deckgl);
    }

    const originalAddLayer = newMap.addLayer.bind(newMap);
    newMap.addLayer = (layer, beforeId) => {
      const result = originalAddLayer(layer, beforeId);
      if (isZonalAnalysisActive()) redrawZonalAnalysis();
      if (isMeasurementToolActive()) redrawMeasurement();
      return result;
    };

    // Event when resized
    window.addEventListener("resize", (_) => {
      setTimeout(function () {
        newMap.resize();
      }, 1);
    });

    // Event for pitch
    if (id === 0) {
      newMap.on("pitch", function () {
        dispatch(
          Actions.Map.changePosition(
            {
              pitch: newMap.getPitch(),
            },
            id,
          ),
        );
      });
    }

    return () => {
      unregisterMap(id);
    };
  }, []);

  /** Dashboard extent changed */
  useEffect(() => {
    if (id === 0 && map && dashboardExtent && !position) {
      zoomToExtent(map, dashboardExtent, id);
    }
  }, [map, dashboardExtent]);

  /** Extent changed */
  useEffect(() => {
    if (id === 0 && map && extent && extentTriggeredBy !== id) {
      zoomToExtent(map, extent, id);
    }
  }, [map, mapExtent]);

  /** Position changed */
  useEffect(() => {
    if (id === 0 && map && position && positionTriggeredBy !== id) {
      setTimeout(function () {
        map.easeTo({
          ...(position.pitch !== undefined && { pitch: position.pitch }),
          ...(position.bearing !== undefined && { bearing: position.bearing }),
          ...(position.zoom !== undefined && { zoom: position.zoom }),
          ...(position.center !== undefined && { center: position.center }),
        });
      }, 100);
    }
  }, [map, mapPosition]);

  /*** Render layer to maplibre */
  const renderLayer = (
    id: string,
    source: SourceSpecification,
    layer: Omit<LayerSpecification, "id" | "source">,
  ) => {
    removeLayer(map, id);
    removeSource(map, id);
    map.addSource(id, source);
    addLayerWithOrder(
      map,
      {
        ...layer,
        id: id,
        source: id,
      },
      Variables.LAYER_CATEGORY.BASEMAP,
    );
  };

  /** Basemap changed */
  useEffect(() => {
    if (map && basemapLayer) {
      renderLayer(BASEMAP_ID, basemapLayer, { type: "raster" });
    }
  }, [map, basemapLayer]);

  /** Indicator layer transparency */
  useEffect(() => {
    updateIndicatorLayerTransparency(map, indicatorLayerTransparency);
    indicatorTransparencyRef.current = indicatorLayerTransparency;
  }, [indicatorLayerTransparency]);

  /** Indicator layer transparency */
  useEffect(() => {
    updateContextLayerTransparency(map, contextLayerTransparency);
    contextTransparencyRef.current = contextLayerTransparency;
  }, [contextLayerTransparency]);

  return (
    <>
      <div key={container} id={container} className="Maplibre"></div>
      <ContextLayers map={map} />
    </>
  );
}
