import {
  CompositeIndexLayerType,
  dataFieldsDefault,
} from "../../../utils/indicatorLayer";
import {
  IndicatorLayer,
  IndicatorLayerConfig,
} from "../../../types/IndicatorLayer";

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

export const configToExpression = (
  composite: Array<CompositeIndexLayerConfigIndicatorLayer>,
  indicatorLayers: IndicatorLayer[],
) => {
  const expression: string[] = [];
  // @ts-ignore
  composite?.config?.indicatorLayers.map((layer: any) => {
    const indicatorLayer = indicatorLayers.find(
      (indicatorLayer) => indicatorLayer.id.toString() === layer.id.toString(),
    );
    if (indicatorLayer) {
      indicatorLayer.indicators.map((indicator) => {
        const id = indicator.shortcode ? indicator.shortcode : indicator.id;
        let normalized = `((context.values['${id}'] - context.values['${id}_min']) / (context.values['${id}_max'] - context.values['${id}_min'])) *  10`;
        if (layer.invert) {
          normalized = `10 - ${normalized}`;
        }
        expression.push(`(${layer.weight} * ${normalized})`);
      });
    }
  });
  return `
    {% set result = ${expression.join(" + ")} %}
    {{ result  | round(2)}}
  `;
};
