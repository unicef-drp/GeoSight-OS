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
 * __date__ = '20/03/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { forwardRef, memo, useEffect, useImperativeHandle } from "react";
import { INIT_DATA } from "../../utils/queryExtraction";
import { useDispatch, useSelector } from "react-redux";
import maplibregl from "maplibre-gl";
import { ProjectCheckpoint as ProjectCheckpointType } from "../../types/ProjectCheckpoint";
import { Actions } from "../../store/dashboard";
import { dictDeepCopy } from "../../utils/main";
import { compareFilters, filtersToFlatDict } from "../../utils/filters";
import { changeIndicatorLayersForcedUpdate } from "../../pages/Dashboard/LeftPanel/IndicatorLayers";
import { BasemapLayer } from "../../types/BasemapLayer";
import { ContextLayer } from "../../types/ContextLayer";
import { IndicatorLayer } from "../../types/IndicatorLayer";

export interface Props {
  map: maplibregl.Map;
  setProjectCheckpointEnable: (enabled: boolean) => void;
}

/** Handling project checkpoints.*/
export const ProjectCheckpoint = memo(
  forwardRef(({ map, setProjectCheckpointEnable }: Props, ref) => {
    const dispatch = useDispatch();
    // @ts-ignore
    const dashboardData = useSelector((state) => state.dashboard.data);
    const selectedIndicatorLayer = useSelector(
      // @ts-ignore
      (state) => state.selectedIndicatorLayer,
    );
    const selectedIndicatorSecondLayer = useSelector(
      // @ts-ignore
      (state) => state.selectedIndicatorSecondLayer,
    );
    // @ts-ignore
    const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
    const {
      basemapLayer,
      contextLayers,
      indicatorShow,
      contextLayersShow,
      is3dMode,
      transparency,
      // @ts-ignore
    } = useSelector((state) => state.map);

    // Extent
    const bounds = map?.getBounds();
    let extent = null;
    if (bounds) {
      extent = [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat];
    }
    const { contextLayers: contextLayersDashboard } = dashboardData;

    // Open
    useImperativeHandle(ref, () => ({
      /** Get data */
      getData() {
        const selectedIndicatorLayers = [selectedIndicatorLayer?.id];
        if (selectedIndicatorSecondLayer?.id) {
          selectedIndicatorLayers.push(selectedIndicatorSecondLayer?.id);
        }
        const context_layers_config: { [key: string]: object } = {};
        contextLayersDashboard.map((contextLayer: ContextLayer) => {
          context_layers_config[contextLayer.id] = contextLayer.configuration;
        });
        return {
          selected_basemap: basemapLayer?.id,
          selected_indicator_layers: selectedIndicatorLayers,
          selected_context_layers: Object.keys(contextLayers).map((id) =>
            parseInt(id),
          ),
          filters: dashboardData.filters
            ? dashboardData.filters
            : INIT_DATA.GROUP(),
          extent: extent,
          indicator_layer_show: indicatorShow,
          context_layer_show: contextLayersShow,
          selected_admin_level: selectedAdminLevel.level,
          is_3d_mode: is3dMode,
          position: {
            pitch: map?.getPitch(),
            bearing: map?.getBearing(),
            zoom: map?.getZoom(),
            center: map?.getCenter(),
          },
          context_layers_config: context_layers_config,
          transparency_config: transparency,
        };
      },
      /** Apply data **/
      applyData(data: ProjectCheckpointType) {
        dispatch(
          Actions.Map.update({
            is3dMode: data?.is_3d_mode,
            position: data.position,
          }),
        );
        const newDashboard = dictDeepCopy(dashboardData);
        newDashboard.basemapsLayers.map((layer: BasemapLayer) => {
          layer.visible_by_default = layer.id === data.selected_basemap;
        });

        // Activate compare
        changeIndicatorLayersForcedUpdate(data.selected_indicator_layers);
        if (data.selected_indicator_layers?.length >= 2) {
          dispatch(Actions.MapMode.activateCompare());
        } else {
          dispatch(Actions.MapMode.deactivateCompare());
        }

        const { context_layers_config } = data;
        newDashboard.contextLayers.map((layer: ContextLayer) => {
          layer.visible_by_default = data.selected_context_layers.includes(
            layer.id,
          );
          // try {
          //   // @ts-ignore
          //   if (context_layers_config[layer.id]) {
          //     // @ts-ignore
          //     layer.configuration = {
          //       // @ts-ignore
          //       ...layer.configuration,
          //       // @ts-ignore
          //       ...context_layers_config[layer.id]
          //     }
          //   }
          // } catch (err) {
          // }
        });
        newDashboard.indicatorLayers.map((layer: IndicatorLayer) => {
          layer.visible_by_default = data.selected_indicator_layers.includes(
            layer.id,
          );
        });
        newDashboard.filters = compareFilters(
          newDashboard.filters,
          filtersToFlatDict(data.filters),
        );
        dispatch(
          Actions.Dashboard.update(JSON.parse(JSON.stringify(newDashboard))),
        );
        dispatch(Actions.Map.showHideContextLayer(data.context_layer_show));
        dispatch(Actions.Map.showHideIndicator(data.indicator_layer_show));

        // Default transparency_config
        if (!data.transparency_config) {
          data.transparency_config = {
            indicatorLayer: 100,
            contextLayer: 100,
          };
        }
        dispatch(
          Actions.Map.update({ transparency: data.transparency_config }),
        );

        if (
          data.selected_admin_level !== null &&
          selectedAdminLevel.level !== data.selected_admin_level
        ) {
          setTimeout(() => {
            dispatch(
              Actions.SelectedAdminLevel.change({
                level: data.selected_admin_level,
              }),
            );
          }, 500);
        }
      },
    }));

    // Change selected bookmark when there is embed config
    useEffect(() => {
      setProjectCheckpointEnable(
        basemapLayer && extent && selectedIndicatorLayer,
      );
    }, [basemapLayer, extent, selectedIndicatorLayer]);

    /** Render **/
    return null;
  }),
);
