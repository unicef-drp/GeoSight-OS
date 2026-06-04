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

import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import ReferenceLayerCentroid from "./ReferenceLayerCentroid";
import ReferenceLayers from "./Layers/ReferenceLayer";
import ContextLayers from "./Layers/ContextLayers";
import { Plugin, PluginChild } from "./utils/Plugin";
import {
  ThreeDimensionOffIcon,
  ThreeDimensionOnIcon,
} from "../../../components/Icons";

// Toolbars
import {
  Bookmark,
  CompareLayer,
  DataDownloader,
  EmbedControl,
  GlobalDateSelector,
  HomeButton,
  LabelToggler,
  PopupToolbars,
  SearchGeometryInput,
  TiltControl,
  ToggleSidePanel,
} from "../Toolbars";
import { EmbedConfig } from "../../../utils/embed";
import { Actions } from "../../../store/dashboard";
import DatasetGeometryData from "./utils/DatasetGeometryData";
import IndicatorLayersReferenceControl
  from "./IndicatorLayersReferenceController";
import { Variables } from "../../../utils/Variables";
import { isDashboardToolEnabled } from "../../../selectors/dashboard";
import MobileBottomNav from "../../../components/MobileBottomNav";
import { SearchGeometryMobile } from "../Toolbars/SearchGeometryInput";
import ReferenceLayerLevelSelection
  from "../Toolbars/ReferenceLayerLevelSelection";
import ZoomToFilteredGeometries
  from "../../../components/ZoomToFilteredGeometries";
import MapLibre from "./MapLibre";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.scss";

// Initialize cog
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";

maplibregl.addProtocol("cog", cogProtocol);

/**
 * MapLibre component.
 */
export default function Map({ leftPanelProps, rightPanelProps }) {
  const dispatch = useDispatch();
  const drawingRef = useRef(null);

  const [map, setMap] = useState(null);
  const [deckgl, setDeckGl] = useState(null);

  const { is3dMode, force } = useSelector((state) => state.map);
  const view3DEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.VIEW_3D),
  );
  const embedToolEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.EMBED_TOOL),
  );

  return (
    <section
      className={"DashboardMap" + (!EmbedConfig().map ? " HideMap" : "")}
    >
      {/* TOOLBARS */}
      <div className="Toolbar">
        <ZoomToFilteredGeometries map={map} />
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
          <ReferenceLayerLevelSelection />
          <GlobalDateSelector />
        </div>

        <div className="Toolbar-Middle">
          <div className="Separator" />
          <HomeButton map={map} />
          <LabelToggler />
          <CompareLayer disabled={is3dMode} />
          {/* 3D View */}
          <Plugin hidden={!view3DEnable}>
            <div
              className="ExtrudedIcon Active"
              data-tool={Variables.DASHBOARD.TOOL.VIEW_3D}
            >
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
          <PopupToolbars map={map} ref={drawingRef} />
          <div className="Separator" />
        </div>

        {/* Embed */}
        <div className="Toolbar-Right">
          <SearchGeometryInput map={map} />
          <Plugin className="EmbedControl" hidden={!embedToolEnable}>
            <div
              className="Active"
              data-tool={Variables.DASHBOARD.TOOL.EMBED_TOOL}
            >
              <PluginChild title={"Get embed code"}>
                <EmbedControl map={map} />
              </PluginChild>
            </div>
          </Plugin>
          <DataDownloader />
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

      <SearchGeometryMobile />

      <div id="map-content">
        <MapLibre
          key={0}
          id={0}
          map={map}
          setMap={setMap}
          setDeckGl={setDeckGl}
          drawingRef={drawingRef}
        />
      </div>

      <ReferenceLayers map={map} deckgl={deckgl} is3DView={is3dMode} />
      <ContextLayers map={map} />
      {map ? (
        <>
          <IndicatorLayersReferenceControl />
          <DatasetGeometryData />
          <ReferenceLayerCentroid map={map} />
        </>
      ) : null}

      {/* Navbar footer */}
      <MobileBottomNav />
    </section>
  );
}
