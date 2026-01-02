import {
  CompositeIndexLayerType,
  dataFieldsDefault,
} from "../../../utils/indicatorLayer";
import {
  IndicatorLayer,
  IndicatorLayerConfig,
} from "../../../types/IndicatorLayer";
import { DYNAMIC_QUANTITATIVE } from "../../../utils/Style";
import { dynamicClassificationChoices } from "../../../pages/Admin/Style/Form/DynamicStyleConfig";
import {
  newRule,
  NO_DATA_RULE,
} from "../../../pages/Admin/Style/Form/StyleRules";

export const defaultCompositeIndexLayer = (): IndicatorLayerConfig => {
  const no_data_rule = newRule(
    [],
    true,
    NO_DATA_RULE,
    NO_DATA_RULE,
    // @ts-ignore
    preferences.style_no_data_fill_color,
    // @ts-ignore
    preferences.style_no_data_outline_color,
    // @ts-ignore
    preferences.style_no_data_outline_size,
    -1,
  );
  const style_config = {
    dynamic_classification: dynamicClassificationChoices[0].value,
    dynamic_class_num: 7,
    sync_outline: false,
    sync_filter: false,
    // @ts-ignore
    outline_color: preferences.style_dynamic_style_outline_color,
    // @ts-ignore
    outline_size: preferences.style_dynamic_style_outline_size,
    // @ts-ignore
    color_palette: preferences.default_color_palette,
    no_data_rule: no_data_rule,
  };
  return {
    data_fields: dataFieldsDefault(),
    config: {},
    type: CompositeIndexLayerType,
    style_type: DYNAMIC_QUANTITATIVE,
    style_config: style_config,
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
  const total =
    // @ts-ignore
    composite?.config?.indicatorLayers?.reduce(
      (sum: number, layer: any) => sum + (layer.weight || 0),
      0,
    ) || 0;

  // @ts-ignore
  composite?.config?.indicatorLayers.map((layer: any) => {
    const indicatorLayer = indicatorLayers.find(
      (indicatorLayer) => indicatorLayer.id.toString() === layer.id.toString(),
    );
    const weight = layer.weight / total;
    if (indicatorLayer) {
      if (indicatorLayer.indicators.length) {
        indicatorLayer.indicators.map((indicator) => {
          const id = indicator.shortcode ? indicator.shortcode : indicator.id;
          let normalized = `(((context.values['${id}'] | default(0, true)) - (context.values['${id}_min'] | default(0, true))) / ((context.values['${id}_max'] | default(1, true)) - (context.values['${id}_min'] | default(0, true)))) *  10`;
          if (layer.invert) {
            normalized = `(10 - ${normalized})`;
          }
          expression.push(`(${weight} * ${normalized})`);
        });
      } else {
        const id = "layer_" + layer.id;
        let normalized = `(((context.values['${id}'] | default(0, true)) - (context.values['${id}_min'] | default(0, true))) / ((context.values['${id}_max'] | default(1, true)) - (context.values['${id}_min'] | default(0, true)))) *  10`;
        if (layer.invert) {
          normalized = `(10 - ${normalized})`;
        }
        expression.push(`(${weight} * ${normalized})`);
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
