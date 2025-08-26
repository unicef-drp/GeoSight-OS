import { DashboardTool } from "../store/dashboard/reducers/dashboardTool";
import { EmbedConfig } from "../utils/embed";

/** Check if a dashboard tool is enabled.
 * By the tool name. */
export const isDashboardToolEnabled =
  (name: string) =>
  (state: any): boolean => {
    if (!state.dashboard.data?.show_map_toolbar) {
      return false;
    }
    return (
      (
        state.dashboard.data?.tools.find(
          (tool: DashboardTool) => tool.name === name,
        ) || null
      )?.visible_by_default === true
    );
  };

export const isFilterContentVisible =
  () =>
  (state: any): boolean => {
    return !state?.dashboard?.data?.filtersBeingHidden === true;
  };

export const isIndicatorLayerContentVisible =
  () =>
  (state: any): boolean => {
    const layer_tabs_visibility =
      state?.dashboard?.data?.layer_tabs_visibility || [];
    return (
      !!EmbedConfig().layer_tab &&
      layer_tabs_visibility.includes("indicator_layers")
    );
  };

export const isContextLayerContentVisible =
  () =>
  (state: any): boolean => {
    const layer_tabs_visibility =
      state?.dashboard?.data?.layer_tabs_visibility || [];
    return (
      !!EmbedConfig().layer_tab &&
      layer_tabs_visibility.includes("context_layers")
    );
  };
