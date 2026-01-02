import { IndicatorLayer } from "../../../types/IndicatorLayer";
import { MultiIndicatorType, StringType } from "../../../utils/indicatorLayer";
import { dataStructureToListData } from "../../SortableTreeForm/utilities";
import { Actions } from "../../../store/dashboard";
import { delay } from "../../../utils/main";

export function isEligibleForCompositeLayer(layer: IndicatorLayer): boolean {
  if (!layer.type) {
    return false;
  }
  return ![MultiIndicatorType, StringType].includes(layer.type);
}

export function disabledCompositeLayer(
  dispatch: any,
  indicatorLayers: any,
  indicatorLayersStructure: any,
) {
  const previousLayer = dataStructureToListData(
    indicatorLayers,
    indicatorLayersStructure,
  ).find((layer: any) => !layer.isGroup)?.data;
  if (previousLayer) {
    dispatch(
      // @ts-ignore
      Actions.CompositeIndicatorLayer.updateIndicatorLayers([previousLayer.id]),
    );
    (async () => {
      await delay(100);
      dispatch(Actions.MapMode.toggleCompositeMode());
      dispatch(Actions.SelectedIndicatorLayer.change(previousLayer));
    })();
  }
}
