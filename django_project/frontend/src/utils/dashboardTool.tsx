import {
  DashboardTool,
  DashboardToolState,
} from "../store/dashboard/reducers/dashboardTool";

export const getDashboardTool = (
  state: DashboardToolState,
  name: string,
): DashboardTool | null => {
  return state.find((tool) => tool.name === name) || null;
};
