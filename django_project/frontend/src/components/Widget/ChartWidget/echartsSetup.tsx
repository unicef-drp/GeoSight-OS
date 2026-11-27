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
 * __date__ = '23/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   ECHARTS SETUP
   Only imported through a dynamic import() so it becomes its own chunk.
   Register only the parts the chart widget uses (tree-shaking).
   ========================================================================== */

import * as echarts from "echarts/core";
import {
  BarChart,
  EffectScatterChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
} from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  EffectScatterChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreemapChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
  SVGRenderer,
]);

export default echarts;
