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
 * __date__ = '12/05/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { Actions } from "../../../../store/dashboard";
import { Variables } from "../../../../utils/Variables";
import SDMXLayerConfig
  from "../../../Admin/Dashboard/Form/IndicatorLayers/SDMXLayer";
import { SDMXIndicatorLayerType } from "../../../../utils/indicatorLayer";

import "./style.scss";

/**
 * SDMX Layer Creation component.
 */
export function SDMXLayerCreation() {
  const dispatch = useDispatch();
  const sdmxConfigRef = useRef(null);
  const sdmxConfigEditorRef = useRef(null);
  const indicatorLayersStructure = useSelector(
    (state) => state.dashboard.data?.indicatorLayersStructure,
  );
  const layerEdit = useSelector(
    (state) => state.selectionState?.indicatorLayerId.edit,
  );
  const layerDelete = useSelector(
    (state) => state.selectionState?.indicatorLayerId.delete,
  );

  useEffect(() => {
    if (!indicatorLayersStructure?.id) {
      indicatorLayersStructure.id = uuidv4() + "";
    }
  }, [indicatorLayersStructure]);

  useEffect(() => {
    if (layerEdit) {
      if (layerEdit.type === SDMXIndicatorLayerType)
        sdmxConfigEditorRef.current.open();
    }
  }, [layerEdit]);

  useEffect(() => {
    if (layerDelete) {
      dispatch(Actions.IndicatorLayers.remove(layerDelete));
    }
  }, [layerDelete]);

  return (
    <>
      <Plugin>
        <div
          className="Active"
          data-tool={Variables.DASHBOARD.TOOL.SDMX_LAYER_CREATION}
        >
          <PluginChild title={"Create SDMX layer"}>
            <AddIcon
              style={{
                border: "1px solid var(--primary-color)",
                borderRadius: "50%",
              }}
              onClick={() => {
                sdmxConfigRef.current.open();
              }}
            />
          </PluginChild>
        </div>
      </Plugin>
      <SDMXLayerConfig
        onUpdate={(layer) => {
          layer.group = indicatorLayersStructure?.id;
          layer.isLocal = true;
          dispatch(
            Actions.IndicatorLayers.add(JSON.parse(JSON.stringify(layer))),
          );
        }}
        onClose={() => {
          dispatch(Actions.SelectionState.editIndicatorLayer(null));
          dispatch(Actions.SelectionState.deleteIndicatorLayer(null));
        }}
        ref={sdmxConfigRef}
      />
      {layerEdit && (
        <SDMXLayerConfig
          indicatorLayer={layerEdit}
          onUpdate={(layer) => {
            dispatch(Actions.IndicatorLayers.update(layer));
          }}
          onClose={() => {
            dispatch(Actions.SelectionState.editIndicatorLayer(null));
            dispatch(Actions.SelectionState.deleteIndicatorLayer(null));
          }}
          ref={sdmxConfigEditorRef}
        />
      )}
    </>
  );
}

export default memo(SDMXLayerCreation);
