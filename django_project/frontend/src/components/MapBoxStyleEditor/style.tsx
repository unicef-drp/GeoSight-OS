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
 * __date__ = '01/10/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export const DEFAULT_STYLES = {
  circle: {
    type: "circle",
    source: "source",
    paint: {
      "circle-color": "#1CABE2",
      "circle-opacity": 0.6,
    },
    filter: ["all", ["==", "$type", "Point"]],
  },
  symbol: {
    type: "symbol",
    source: "source",
    filter: ["all", ["==", "$type", "Point"]],
    layout: {
      "icon-image": "/static/img/point.png",
      "icon-size": 0.1,
    },
  },
  line: {
    type: "line",
    source: "source",
    paint: {
      "line-color": "#1CABE2",
      "line-width": 1,
    },
    filter: ["all", ["==", "$type", "LineString"]],
  },
  fill: {
    type: "fill",
    source: "source",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": "#1CABE2",
      "fill-opacity": 1,
    },
  },
};

export const MapboxOperator = {
  "==": "equals",
  "!=": "not equals",
  "<": "less than",
  "<=": "less than or equal to",
  ">": "greater than",
  ">=": "greater than or equal to",
};
