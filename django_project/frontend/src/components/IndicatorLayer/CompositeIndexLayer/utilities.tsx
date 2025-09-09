import { IndicatorLayer } from "../../../types/IndicatorLayer";
import { MultiIndicatorType } from "../../../utils/indicatorLayer";

export function isEligibleForCompositeLayer(layer: IndicatorLayer): boolean {
  if (!layer.type) {
    return false;
  }
  return ![MultiIndicatorType].includes(layer.type);
}
