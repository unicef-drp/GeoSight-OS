import { dictDeepCopy } from "./main";
import { Indicator } from "../types/Indicator";
import { IndicatorLayer } from "../types/IndicatorLayer";
import {
  DashboardTool,
  DashboardToolState,
} from "../store/dashboard/reducers/dashboardTool";
import { WidgetLayerUsed } from "../components/Widget/Definition";

/** Clean dashboard data */
export const cleanDashboardData = (data: any) => {
  try {
    data.referenceLayer = {
      identifier: data?.referenceLayer?.identifier,
      bbox: data?.referenceLayer?.bbox,
    };
  } catch (err) {}
  data?.indicatorLayers?.map((ctx: any) => {
    ["group", "loading", "disabled", "legend", "trueId"].map((key) => {
      try {
        delete ctx[key];
      } catch (err) {}
    });
  });
  data?.contextLayers?.map((ctx: any) => {
    ["group", "loading", "disabled", "legend", "trueId", "parameters"].map(
      (key) => {
        try {
          delete ctx[key];
        } catch (err) {}
      },
    );
  });
};

/** Compare dashboard data is same or not */
export const isDashboardDataSame = (original: any, target: any) => {
  const _original = dictDeepCopy(original);
  const _target = dictDeepCopy(target);
  cleanDashboardData(_original);
  cleanDashboardData(_target);

  // If the identifier is different, the extent of target should be the same with bbox on the _target.referenceLayer
  if (
    _target?.referenceLayer?.identifier &&
    _original?.referenceLayer?.identifier !==
      _target?.referenceLayer?.identifier
  ) {
    try {
      delete _target.levelConfig;
      delete _original.levelConfig;
    } catch (err) {}
    if (
      _target.referenceLayer.bbox &&
      JSON.stringify(_target.referenceLayer.bbox) !==
        JSON.stringify(_target.extent)
    ) {
      try {
        delete _target.extent;
        delete _original.extent;
        delete _target.referenceLayer;
        delete _original.referenceLayer;
      } catch (err) {}
    }
  }
  return JSON.stringify(_original) === JSON.stringify(_target);
};

/**
 * Get dashboard tool by name
 */
export const getDashboardTool = (
  state: DashboardToolState,
  name: string,
): DashboardTool | null => {
  return state.find((tool) => tool.name === name) || null;
};

/**
 * Check is id is indicator or indicator later and return the object
 */
export const getIndicatorOrIndicatorLater = (
  id: number,
  layerUsed: string,
  indicators: Indicator[],
  indicatorLayers: IndicatorLayer[],
): null | Indicator | IndicatorLayer => {
  switch (layerUsed) {
    case WidgetLayerUsed.INDICATOR:
      return indicators.find((layer) => {
        return layer.id === id;
      });
      break;
    case WidgetLayerUsed.INDICATOR_LAYER:
      return indicatorLayers.find((layer) => {
        return layer.id === id;
      });
    default:
      return null;
  }
};
