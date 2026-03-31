/***
 * Log system based on the debug
 */
import { testExampleQueries } from "./alasql";

export let IS_DEBUG = false;
try {
  IS_DEBUG = DEBUG;
} catch (e) {}

export const Logger = {
  log: function (key, text) {
    if (IS_DEBUG) {
      console.log(key + text);
      try {
        testExampleQueries();
        console.log("ALASQL:OK");
      } catch (e) {
        console.log("ALASQL: Error ", e);
      }
    }
  },
  layers: function (map) {
    if (IS_DEBUG) {
      const output = map.getStyle();
      Logger.log(
        "LAYERS:",
        output.layers.map((layer) => layer.id),
      );
      Logger.log(
        "LAYERS-VISIBLE:",
        output.layers
          .filter((layer) => {
            return layer?.layout?.visibility !== "none";
          })
          .map((layer) => layer.id),
      );

      // Zoom to the layer
      const labelLayer = output.layers.find((layer) =>
        /^context-layer-\d+-label$/.test(layer.id),
      );
      if (labelLayer) {
        const features = output.sources[labelLayer.source]?.data?.features;
        if (!features?.length) return;
        let minLng = Infinity,
          minLat = Infinity,
          maxLng = -Infinity,
          maxLat = -Infinity;
        const extendCoords = (coords) => {
          if (Array.isArray(coords[0])) {
            coords.forEach(extendCoords);
          } else {
            if (coords[0] < minLng) minLng = coords[0];
            if (coords[0] > maxLng) maxLng = coords[0];
            if (coords[1] < minLat) minLat = coords[1];
            if (coords[1] > maxLat) maxLat = coords[1];
          }
        };
        features.forEach((f) => extendCoords(f.geometry.coordinates));
        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 20 },
        );
      }
    }
  },
};
