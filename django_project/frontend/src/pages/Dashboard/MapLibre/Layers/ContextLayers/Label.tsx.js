import { formatStyle } from "../../../../../utils/label.tsx";
import { hasLayer, hasSource } from "../../utils";
import { addLayerWithOrder } from "../../Render";
import { Variables } from "../../../../../utils/Variables";
import { Logger } from "../../../../../utils/logger";

/** Render label **/
export const renderContextLayerLabel = (sourceId, map, config, sourceLayer) => {
  const { paint, layout, minZoom, maxZoom } = formatStyle(config);
  const layerId = sourceId + "-label";
  if (hasLayer(map, layerId)) {
    map.removeLayer(layerId);
  }
  if (hasSource(map, layerId)) {
    map.removeSource(layerId);
  }
  const layerConfig = {
    id: layerId,
    type: "symbol",
    source: sourceId,
    filter: ["==", "$type", "Point"],
    layout: layout,
    paint: { ...paint },
    maxzoom: maxZoom,
    minzoom: minZoom,
  };
  if (sourceLayer) {
    layerConfig["source-layer"] = sourceLayer;
  }
  addLayerWithOrder(map, layerConfig, Variables.LAYER_CATEGORY.CONTEXT_LAYER);
  Logger.layers(map);
  console.log("--------------------------------");
  console.log(map.getStyle().layers);
};
