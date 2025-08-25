import { DashboardTool } from "../store/dashboard/reducers/dashboardTool";

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
