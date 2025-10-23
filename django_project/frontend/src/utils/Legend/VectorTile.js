/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '30/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { createElement } from "../../pages/Dashboard/MapLibre/utils";
import { dictDeepCopy } from "../main";
import LegendControl from "mapboxgl-legend";

function replaceColorTex(html, color, text) {
  /**
   * Replace text of color in legend with text
   */
  return html.replace(`>${color}`, `>${text}`);
}

/** Change text by the filter. */
function byFilter(layer) {
  let colorKey = "";
  switch (layer.type) {
    case "circle":
      colorKey = "circle-color";
      break;
  }

  /**
   * Get the key based on the filter
   */
  let label = [];
  if (layer.filter) {
    layer.filter.map((filter) => {
      if (Array.isArray(filter) && filter.length === 3) {
        if (filter[1] !== "$type") {
          label.push(`${filter[1]} ${filter[0]} ${filter[2]}`);
        }
      }
    });
  }

  return {
    label: [...new Set(label)].join(", "),
    color: layer.paint ? layer.paint[colorKey] : null,
  };
}

/** Change text by the radius. */
function byRadius(layer) {
  const rules = [];
  let label = "";
  if (layer.paint) {
    const radius = layer.paint["circle-radius"];
    if (radius) {
      if (Array.isArray(radius)) {
        switch (radius[0]) {
          case "interpolate": {
            if (radius[1] + "" === "linear") {
              const field = radius[2];
              if (field[0] === "get") {
                label = field[1];
                for (let i = 3; i < radius.length; i++) {
                  if (i % 2 === 0) {
                    rules.push({
                      value: radius[i - 1],
                      rule: radius[i],
                    });
                  }
                }
              }
            }
            break;
          }
        }
      } else {
        if (!isNaN(radius)) {
          rules.push({
            value: radius,
            rule: "",
          });
        }
      }
    }
  }

  return {
    label: label,
    rules: rules,
  };
}

/**
 * Legend of Vector Tile
 * Return string of html
 */
export function vectorTileLegend(layers) {
  const legend = new LegendControl();
  const legendHtml = [];

  // Check every layer
  let radius = [];
  layers
    .filter((layer) => layer.source && layer.source !== "composite")
    .forEach((layer) => {
      const { id, layout, paint, metadata } = layer;

      if (layer["hide-legend"]) {
        return;
      }

      // Construct all required blocks, break if none
      let paneBlocks = Object.entries({ ...layout, ...paint }).reduce(
        (acc, [attribute, value]) => {
          try {
            const blocks = legend._getBlocks("Key", layer, attribute, value);
            blocks?.forEach((block) => acc.push(block));
          } catch (e) {
            // Error
            if (attribute === "icon-image" && (value.includes("http") || value.includes("data:"))) {
              const element = createElement("ul", {
                classes: ["list"],
                content: [
                  createElement("li", {
                    events: {},
                    content: [
                      createElement("img", {
                        classes: ["icon"],
                        attributes: { src: value, height: 40 },
                      }),
                      "",
                    ],
                  }),
                ],
              });

              acc.push(element);
            }
          }
          return acc;
        },
        [],
      );
      if (paneBlocks.length === 0) {
        return;
      }

      // Create pane
      const pane = createElement("details", {
        classes: ["mapboxgl-ctrl-legend-pane"],
        attributes: { open: true },
        content: [
          createElement("summary", {
            content: [metadata?.name || metadata?.label || id],
          }),
          ...paneBlocks,
        ],
      });

      // Update value for case
      let outerHtml = pane.outerHTML;

      /** Switch based on the style */
      let radiusLabel = "";
      try {
        const { label, rules } = byRadius(layer);
        radiusLabel = label;
        radius = radius.concat(rules.map((rule) => rule.value));
      } catch (e) {}

      /** Switch based on the style */
      try {
        let { label, color } = byFilter(layer);
        if (!label && radiusLabel) {
          label = radiusLabel;
        }
        if (layer.name) {
          label = layer.name;
        }
        if (color && label) {
          outerHtml = replaceColorTex(outerHtml, color, label);
        }
      } catch (e) {}

      /** This is for cases of paint **/
      if (layer.paint) {
        for (const [key, value] of Object.entries(layer.paint)) {
          switch (value[0]) {
            case "case": {
              const paints = dictDeepCopy(value);
              paints.shift();
              let last = paints.pop();
              paints.map((paint, idx) => {
                if (idx % 2 !== 0) {
                  const _case = paints[idx - 1];
                  if (_case[2] !== undefined) {
                    let operator = _case[0] !== "==" ? _case[0] : "";
                    let label = `${_case[2]}`;
                    if (operator) {
                      label = `${operator} ${label}`;
                    }
                    outerHtml = replaceColorTex(outerHtml, paint, label);
                  }
                }
              });
              outerHtml = replaceColorTex(outerHtml, last, `other`);
              break;
            }
          }
        }
      }
      legendHtml.push(outerHtml);
    });

  let output = legendHtml.join("<br/>");
  // If radius are same, we remove the bubble
  try {
    if ([...new Set(radius)].length === 1) {
      output = output.replaceAll(
        '<ul class="bubbles bubbles--">',
        '<ul class="bubbles bubbles--" hidden>',
      );
    }
  } catch (e) {}
  return output;
}
