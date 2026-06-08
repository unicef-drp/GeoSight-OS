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
import ReferenceLayerCentroid from "./ReferenceLayerCentroid";
import ReferenceLayers from "./Layers/ReferenceLayer";
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
  ProjectOverview,
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
import ReferenceLayerLevelSelection from "../Toolbars/ReferenceLayerSelector";
import ZoomToFilteredGeometries
  from "../../../components/ZoomToFilteredGeometries";
import MainMapLibre from "./MapLibre";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.scss";

/**
 * MapLibre component.
 */
export default function Map({ leftPanelProps, rightPanelProps }) {
  const dispatch = useDispatch();
  const drawingRef = useRef(null);

  // This is for mainMap, which is the first map
  const [mainMap, setMainMap] = useState(null);
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
        <ZoomToFilteredGeometries />
        <TiltControl />
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
          <ProjectOverview />
          <ReferenceLayerLevelSelection />
          <GlobalDateSelector />
        </div>

        <div className="Toolbar-Middle">
          <div className="Separator" />
          <HomeButton />
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
                disabled={!mainMap}
                active={is3dMode}
                onClick={() => {
                  if (is3dMode) {
                    mainMap.easeTo({ pitch: 0 });
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
          <PopupToolbars map={mainMap} ref={drawingRef} />
          <div className="Separator" />
        </div>

        {/* Embed */}
        <div className="Toolbar-Right">
          <SearchGeometryInput map={mainMap} />
          <Plugin className="EmbedControl" hidden={!embedToolEnable}>
            <div
              className="Active"
              data-tool={Variables.DASHBOARD.TOOL.EMBED_TOOL}
            >
              <PluginChild title={"Get embed code"}>
                <EmbedControl map={mainMap} />
              </PluginChild>
            </div>
          </Plugin>
          <DataDownloader />
          <Plugin className="BookmarkControl">
            <Bookmark map={mainMap} />
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

      <div id="map">
        <MainMapLibre
          key={0}
          id={0}
          setParentMap={setMainMap}
          setParentDeckGl={setDeckGl}
          drawingRef={drawingRef}
        />
        {/*<MainMapLibre key={1} id={1} />*/}
        {/*<MainMapLibre key={2} id={2} />*/}
      </div>

      <ReferenceLayers map={mainMap} deckgl={deckgl} is3DView={is3dMode} />
      {mainMap ? (
        <>
          <IndicatorLayersReferenceControl />
          <DatasetGeometryData />
          <ReferenceLayerCentroid map={mainMap} />
        </>
      ) : null}

      {/* Navbar footer */}
      <MobileBottomNav />
    </section>
  );
}
