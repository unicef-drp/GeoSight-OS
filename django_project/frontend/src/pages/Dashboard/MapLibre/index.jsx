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
   MAP CONTAINER
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox/typed";
import ReferenceLayerCentroid from "./ReferenceLayerCentroid";
import ReferenceLayers from "./Layers/ReferenceLayer";
import ContextLayers from "./Layers/ContextLayers";
import { Plugin, PluginChild } from "./Plugin";
import { removeLayer, removeSource } from "./utils";
import {
  ThreeDimensionOffIcon,
  ThreeDimensionOnIcon,
} from "../../../components/Icons";

// Toolbars
import {
  Bookmark,
  CompareLayer,
  DownloaderData,
  EmbedControl,
  GlobalDateSelector,
  HomeButton,
  LabelToggler,
  SearchGeometryInput,
  TiltControl,
  ToggleSidePanel,
} from "../Toolbars";
import { EmbedConfig } from "../../../utils/embed";
import { Actions } from "../../../store/dashboard";
import ReferenceLayerSection from "../MiddlePanel/ReferenceLayer";
import DatasetGeometryData from "./Controllers/DatasetGeometryData";
import IndicatorLayersReferenceControl
  from "./IndicatorLayersReferenceControl";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.scss";

// Initialize cog
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";
import { PopupToolbars } from "../Toolbars/PopupToolbars";
import { Variables } from "../../../utils/Variables";
import { addLayerWithOrder } from "./Render";
import { TransparencyControl } from "./Transparency";

maplibregl.addProtocol("cog", cogProtocol);

const BASEMAP_ID = `basemap`;
let previousLayerIds = [];

/**
 * MapLibre component.
 */
export default function MapLibre({
  leftPanelProps,
  rightPanelProps,
  ...props
}) {
  const dispatch = useDispatch();
  const [map, setMap] = useState(null);
  const [deckgl, setDeckGl] = useState(null);
  const extent = useSelector((state) => state.dashboard.data.extent);
  const { basemapLayer, is3dMode, position, force } = useSelector(
    (state) => state.map,
  );
  const transparencyRef = useRef(null);

  // Tools
  const { tools: dashboardTools } = useSelector(
    (state) => state.dashboard.data,
  );
  const tools = dashboardTools.filter(
    (row) =>
      row.visible_by_default &&
      [
        Variables.DASHBOARD.TOOL.VIEW_3D,
        Variables.DASHBOARD.TOOL.COMPARE_LAYERS,
      ].includes(row.name),
  );

  const drawingRef = useRef(null);
  const redrawMeasurement = () => drawingRef.current.redrawMeasurement();
  const isMeasurementToolActive = () =>
    drawingRef.current.isMeasurementToolActive();
  const redrawZonalAnalysis = () => drawingRef.current.redrawZonalAnalysis();
  const isZonalAnalysisActive = () =>
    drawingRef.current.isZonalAnalysisActive();

  /***
   * Make attribution call Attributions component instead
   */
  class AttributionControl extends maplibregl.AttributionControl {
    _updateCompact() {
      if (this._map?.style) {
        const attributions = [];
        for (const [key, layer] of Object.entries(this._map.style._layers)) {
          const source = this._map.style.sourceCaches[layer.source];
          if (this._map.style.sourceCaches[layer.source]) {
            if (source._source.attribution) {
              attributions.push(source._source.attribution);
            }
          }
        }
        dispatch(
          Actions.GlobalState.update({
            attributions: Array.from(new Set(attributions)),
          }),
        );
      }
    }
  }

  /**
   * FIRST INITIATE
   * */
  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: "map",
        style: {
          version: 8,
          sources: {},
          layers: [],
          glyphs: "/static/fonts/{fontstack}/{range}.pbf",
        },
        center: [0, 0],
        zoom: 1,
        attributionControl: false,
      }).addControl(
        new AttributionControl({
          compact: true,
        }),
      );
      newMap.once("load", () => {
        setMap(newMap);
        setTimeout(
          () =>
            document
              .querySelector(".maplibregl-ctrl-compass")
              .addEventListener("click", () => {
                newMap.easeTo({ pitch: 0, bearing: 0 });
              }),
          500,
        );
      });
      newMap.addControl(new maplibregl.NavigationControl(), "bottom-left");
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
        const popupElements = document.querySelectorAll(
          "#map .maplibregl-popup-anchor-center",
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
        transparencyRef.current.update();
      });

      let mapControl = document.querySelector(
        ".maplibregl-ctrl-bottom-left .maplibregl-ctrl-group",
      );
      let parent = document.getElementById("maplibregl-ctrl-bottom-left");
      parent.appendChild(mapControl);

      let tilt = document.getElementsByClassName("TiltControl")[0];
      parent = document.getElementById("tilt-control");
      parent.appendChild(tilt);

      const deckgl = new MapboxOverlay({
        interleaved: true,
        layers: [],
      });
      newMap.addControl(deckgl);
      setDeckGl(deckgl);

      const originalAddLayer = newMap.addLayer.bind(newMap);
      newMap.addLayer = (layer, beforeId) => {
        originalAddLayer(layer, beforeId);
        if (isZonalAnalysisActive()) redrawZonalAnalysis();
        if (isMeasurementToolActive()) redrawMeasurement();
      };

      // Event when resized
      window.addEventListener("resize", (_) => {
        setTimeout(function () {
          newMap.resize();
        }, 1);
      });
    }
  }, []);

  /**
   * EXTENT CHANGED
   * */
  useEffect(() => {
    if (map && extent && !(position && Object.keys(position).length)) {
      setTimeout(function () {
        map.fitBounds(
          [
            [extent[0], extent[1]],
            [extent[2], extent[3]],
          ],
          {
            pitch: 0,
            bearing: 0,
          },
        );
      }, 100);
    }
  }, [map, extent]);

  /**
   * EXTENT CHANGED
   * */
  useEffect(() => {
    if (map && position && Object.keys(position).length) {
      setTimeout(function () {
        map.easeTo({
          pitch: position.pitch,
          bearing: position.bearing,
          zoom: position.zoom,
          center: position.center,
        });
      }, 100);
    }
  }, [map, position]);

  /***
   * Render layer to maplibre
   * @param {String} id of layer
   * @param {Object} source Layer config options.
   * @param {Object} layer Layer config options.
   */
  const renderLayer = (id, source, layer) => {
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

  /** BASEMAP CHANGED */
  useEffect(() => {
    if (map && basemapLayer) {
      renderLayer(BASEMAP_ID, basemapLayer, { type: "raster" });
    }
  }, [map, basemapLayer]);

  return (
    <section
      className={"DashboardMap" + (!EmbedConfig().map ? " HideMap" : "")}
    >
      {/* TOOLBARS */}
      <div className="Toolbar">
        <TiltControl map={map} is3DView={is3dMode} force={force} />
        <div className="Toolbar-Left">
          {leftPanelProps ? (
            <ToggleSidePanel
              className={leftPanelProps.className}
              initState={leftPanelProps.initState}
              active={leftPanelProps.active}
              onLeft={() => {
                leftPanelProps.onLeft();
              }}
              onRight={() => {
                leftPanelProps.onRight();
              }}
            />
          ) : null}
          <Plugin className={"ReferenceLayerToolbar"}>
            <div>
              <PluginChild
                title={"Reference Layer selection"}
                className={"ReferenceLayerSelectorWrapper"}
              >
                <ReferenceLayerSection />
              </PluginChild>
            </div>
          </Plugin>
          <GlobalDateSelector />
        </div>

        <div className="Toolbar-Middle">
          <div className="Separator" />
          <HomeButton map={map} />
          <LabelToggler />
          {tools.find(
            (tool) => tool.name === Variables.DASHBOARD.TOOL.COMPARE_LAYERS,
          ) ? (
            <CompareLayer disabled={is3dMode} />
          ) : null}
          {/* 3D View */}
          {tools.find(
            (tool) => tool.name === Variables.DASHBOARD.TOOL.VIEW_3D,
          ) ? (
            <Plugin>
              <div className="ExtrudedIcon Active">
                <PluginChild
                  title={"3D layer"}
                  disabled={!map}
                  active={is3dMode}
                  onClick={() => {
                    if (is3dMode) {
                      map.easeTo({ pitch: 0 });
                    }
                    dispatch(Actions.Map.change3DMode(!is3dMode));
                  }}
                >
                  {is3dMode ? (
                    <ThreeDimensionOnIcon />
                  ) : (
                    <ThreeDimensionOffIcon />
                  )}
                </PluginChild>
              </div>
            </Plugin>
          ) : null}
          <PopupToolbars map={map} ref={drawingRef} />
          <div className="Separator" />
        </div>

        {/* Embed */}
        <div className="Toolbar-Right">
          <SearchGeometryInput map={map} />
          <Plugin className="EmbedControl">
            <div className="Active">
              <PluginChild title={"Get embed code"}>
                <EmbedControl map={map} />
              </PluginChild>
            </div>
          </Plugin>
          <DownloaderData />
          <Plugin className="BookmarkControl">
            <Bookmark map={map} />
          </Plugin>
          {rightPanelProps ? (
            <ToggleSidePanel
              className={rightPanelProps.className}
              initState={rightPanelProps.initState}
              active={rightPanelProps.active}
              onLeft={() => {
                rightPanelProps.onLeft();
              }}
              onRight={() => {
                rightPanelProps.onRight();
              }}
            />
          ) : null}
        </div>
      </div>

      <div id="map"></div>

      <ReferenceLayers map={map} deckgl={deckgl} is3DView={is3dMode} />
      <ContextLayers map={map} />
      {map ? (
        <>
          <IndicatorLayersReferenceControl map={map} />
          <DatasetGeometryData />
          <ReferenceLayerCentroid map={map} />
          <TransparencyControl map={map} ref={transparencyRef} />
        </>
      ) : null}
    </section>
  );
}
