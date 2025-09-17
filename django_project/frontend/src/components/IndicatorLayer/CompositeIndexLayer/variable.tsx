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
      if (indicatorLayer.indicators.length) {
        indicatorLayer.indicators.map((indicator) => {
          const id = indicator.shortcode ? indicator.shortcode : indicator.id;
          let normalized = `(((context.values['${id}'] | default(0, true)) - (context.values['${id}_min'] | default(0, true))) / ((context.values['${id}_max'] | default(1, true)) - (context.values['${id}_min'] | default(0, true)))) *  10`;
          if (layer.invert) {
            normalized = `10 - ${normalized}`;
          }
          expression.push(`(${layer.weight} * ${normalized})`);
        });
      } else {
        const id = "layer_" + layer.id;
          let normalized = `(((context.values['${id}'] | default(0, true)) - (context.values['${id}_min'] | default(0, true))) / ((context.values['${id}_max'] | default(1, true)) - (context.values['${id}_min'] | default(0, true)))) *  10`;
        if (layer.invert) {
          normalized = `10 - ${normalized}`;
        }
        expression.push(`(${layer.weight} * ${normalized})`);
      }
    }
  });
  if (expression.length === 0) {
    return "0";
  }
  return `
    {% set result = ${expression.join(" + ")} %}
    {{ result  | round(2)}}
  `;
};


export const DynamicCompositeLayerGroupName = "Dynamic Composite Layers";