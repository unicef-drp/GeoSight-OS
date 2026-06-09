import { IndicatorLayer } from "../../../types/IndicatorLayer";
import {
  MultiIndicatorType,
  SingleIndicatorType,
  StringType,
} from "../../../utils/indicatorLayer";
import { dataStructureToListData } from "../../SortableTreeForm/utilities";
import { Actions } from "../../../store/dashboard";
import { delay } from "../../../utils/main";

export function isEligibleForCompositeLayer(layer: IndicatorLayer): boolean {
  if (!layer?.type) {
    return false;
  }
  if (
    layer.type === SingleIndicatorType &&
    layer.indicators[0].type === StringType
  )
    return false;
  return ![MultiIndicatorType, StringType].includes(layer.type);
}

export function disabledCompositeLayer(
  dispatch: any,
  indicatorLayers: any,
  indicatorLayersStructure: any,
  autoUpdateIndicatorLayers = true,
) {
  const previousLayer = dataStructureToListData(
    indicatorLayers,
    indicatorLayersStructure,
  ).find((layer: any) => !layer.isGroup)?.data;
  if (previousLayer) {
    if (autoUpdateIndicatorLayers) {
      dispatch(
        // @ts-ignore
        Actions.CompositeIndicatorLayer.updateIndicatorLayers([
          previousLayer.id,
        ]),
      );
    }
    (async () => {
      await delay(100);
      dispatch(Actions.MapMode.toggleCompositeMode());
      if (autoUpdateIndicatorLayers) {
        dispatch(Actions.Map.updateIndicatorLayers([previousLayer]));
      }
    })();
  }
}
