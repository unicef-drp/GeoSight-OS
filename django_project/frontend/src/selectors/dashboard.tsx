import { createSelector } from "reselect";
import { DashboardTool } from "../store/dashboard/reducers/dashboardTool";
import { EmbedConfig } from "../utils/embed";

export const getDashboardTool =
  (name: string) =>
  (state: any): DashboardTool => {
    return (
      state.dashboard.data?.tools?.find(
        (tool: DashboardTool) => tool.name === name,
      ) || null
    );
  };

/** Check if a dashboard tool is enabled by tool name. */
export const isDashboardToolEnabled =
  (name: string) =>
  (state: any): boolean => {
    if (!state.dashboard.data?.show_map_toolbar) {
      return false;
    }
    return getDashboardTool(name)(state)?.visible_by_default === true;
  };

export const isFilterContentVisible = (state: any): boolean =>
  !state?.dashboard?.data?.filtersBeingHidden;

export const isProjectUsingConceptUUID = (state: any): boolean =>
  state.dashboard.data?.geoField === "concept_uuid";

export const isIndicatorLayerContentVisible = (state: any): boolean => {
  const layer_tabs_visibility =
    state?.dashboard?.data?.layer_tabs_visibility || [];
  return (
    !!EmbedConfig().layer_tab &&
    layer_tabs_visibility.includes("indicator_layers")
  );
};

export const isContextLayerContentVisible = (state: any): boolean => {
  const layer_tabs_visibility =
    state?.dashboard?.data?.layer_tabs_visibility || [];
  return (
    !!EmbedConfig().layer_tab &&
    layer_tabs_visibility.includes("context_layers")
  );
};

export const getIndicatorLayersOptions = createSelector(
  (state: any) => state.dashboard.data?.indicatorLayers,
  (layers: { id: number; name: string }[] = []) =>
    layers.map(({ id, name }) => ({ id, label: name })),
);
