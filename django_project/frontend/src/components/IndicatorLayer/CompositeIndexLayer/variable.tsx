import {
  CompositeIndexLayerType,
  dataFieldsDefault,
} from "../../../utils/indicatorLayer";
import { IndicatorLayerConfig } from "../../../types/IndicatorLayer";

export const defaultCompositeIndexLayer = (): IndicatorLayerConfig => {
  return {
    data_fields: dataFieldsDefault(),
    config: {},
    type: CompositeIndexLayerType,
  };
};
