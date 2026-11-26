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
import { useSelector } from "react-redux";
import { Plugin, PluginChild } from "./utils/Plugin";

// Toolbars
import {
  Bookmark,
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
import MainMapLibre, { MirrorMapLibre } from "./MapLibre";
import LayerCreationToolbars from "../Toolbars/LayerCreationToolbars";
import MapModeToolbars from "../Toolbars/MapModeToolbars";
import StoryCinematicToolbar from "../Toolbars/StoryCinematic";
import { useStoryPlayback } from "../LeftPanel/StoryMap/StoryPlayback";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.scss";

/**
 * MapLibre component.
 */
export default function Map({ leftPanelProps, rightPanelProps }) {
  const drawingRef = useRef(null);

  // This is for mainMap, which is the first map
  const [mainMap, setMainMap] = useState(null);
  const [deckgl, setDeckGl] = useState(null);
  const embedToolEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.EMBED_TOOL),
  );
  const dataDownloadEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.DATA_DOWNLOAD),
  );
  const bookmarkEnable = useSelector(
    isDashboardToolEnabled(Variables.DASHBOARD.TOOL.SPATIAL_BOOKMARK),
  );
  const story = useStoryPlayback();
  // Share and story tools: one group at the end of the main tools.
  const shareGroupVisible =
    embedToolEnable ||
    dataDownloadEnable ||
    bookmarkEnable ||
    (story.cinematicEnabled && story.total > 0);

  return (
    <section
      className={"DashboardMap" + (!EmbedConfig().map ? " HideMap" : "")}
    >
      {/* TOOLBARS */}
      <div className="Toolbar">
        <ZoomToFilteredGeometries />
        <TiltControl />
        {/* LEFT SIDE OF NAVBAR */}
        <div className="Toolbar-Left">
          {leftPanelProps && (
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
          )}
          <ProjectOverview />
          <ReferenceLayerLevelSelection />
          <GlobalDateSelector />
        </div>
        {/* MIDDLE SIDE OF NAVBAR */}
        <div className="Toolbar-Middle">
          <div className="Separator" />
          <HomeButton />
          <LabelToggler />
          <MapModeToolbars map={mainMap} />
          {/* This is all the toolbars that has popup */}
          <PopupToolbars map={mainMap} ref={drawingRef} />
          <LayerCreationToolbars />
          {/* Embed, download, bookmark and Story Map tools */}
          {shareGroupVisible && (
            <div
              style={{
                borderLeft: "1px solid #E6E8E8",
                height: "30px",
                margin: "0 0.5rem",
              }}
            />
          )}
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
          {/* Always mounted: it also applies bookmarks (story pages too). */}
          <Plugin className="BookmarkControl">
            <Bookmark map={mainMap} />
          </Plugin>
          <StoryCinematicToolbar />
          <div className="Separator" />
        </div>

        {/* RIGHT SIDE OF NAVBAR */}
        <div className="Toolbar-Right">
          <SearchGeometryInput />
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
        <MirrorMapLibre key={1} id={1} />
        <MirrorMapLibre key={2} id={2} />
        <MirrorMapLibre key={3} id={3} />
      </div>

      {mainMap ? (
        <>
          <IndicatorLayersReferenceControl />
          <DatasetGeometryData />
        </>
      ) : null}

      {/* Navbar footer */}
      <MobileBottomNav />
    </section>
  );
}
