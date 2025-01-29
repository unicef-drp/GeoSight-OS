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
 * __author__ = 'francisco.perez@geomatico.es'
 * __date__ = '27/03/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

export const defaultVectorTyleStyle = [
    {
        id: "country-line",
        type: "line",
        source: "source",
        "source-layer": "countries",
        filter: [
            "==",
            "$type",
            "Polygon"
        ],
        paint: {
            "line-width": 1,
            "line-color": "#AAAAAA"
        }
    },
    {
        id: "country-fill",
        type: "fill",
        source: "source",
        "source-layer": "countries",
        filter: [
            "==",
            "$type",
            "Polygon"
        ],
        paint: {
            "fill-opacity": 0
        }
    }
];

export const defaultPointStyle = [{
    id: 'pointLayer',
    type: 'circle',
    source: 'source',
    paint: {
        'circle-color': '#ff7800',
        'circle-opacity': 0.6
    },
    'filter': ['==', '$type', 'Point']
}];

export const defaultAggregationStyle =  [
  {
    "id": "clusterLabel",
    "type": "symbol",
    "source": "source",
    "filter": ["has", "point_count"],
    "layout": {
      "text-field": ["format", ["get", "_value_text_"]],
      "text-font": ["Rubik", "Rubik"],
      "text-size": 10
    },
    "paint": {
      "text-color": [
        "step",
        ["get", "_value_"],
        "#000000",
        250,
        "#000000",
        500,
        "#FFFFFF",
        750,
        "#FFFFFF",
        1000,
        "#FFFFFF"
      ]
    }
  },
  {
    "id": "clusterLayer",
    "type": "circle",
    "source": "source",
    "filter": ["has", "point_count"],
    "paint": {
      "circle-color": [
        "step",
        ["get", "_value_"],
        "#5fff5f",
        250,
        "#4bd448",
        500,
        "#36aa32",
        750,
        "#21831d",
        1000,
        "#004b00"
      ],
      "circle-radius": [
        "step",
        ["get", "_value_"],
        10,
        250,
        15,
        500,
        20,
        750,
        25,
        1000,
        30
      ],
      "circle-stroke-width": 1,
      "circle-stroke-color": "#004b00"
    }
  },
  {
    "id": "unclusterLayer",
    "type": "circle",
    "source": "source",
    "filter": ["!", ["has", "point_count"]],
    "paint": {
      "circle-color": "#0000FF",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#000000"
    }
  }
]