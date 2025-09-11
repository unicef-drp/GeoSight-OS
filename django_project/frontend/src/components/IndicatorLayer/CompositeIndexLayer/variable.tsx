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

export interface CompositeIndexLayerConfigIndicatorLayer {
  id: number;
  weight: number;
  invert: boolean;
}

export const MaxSelectableLayersForCompositeIndexLayer = 100;