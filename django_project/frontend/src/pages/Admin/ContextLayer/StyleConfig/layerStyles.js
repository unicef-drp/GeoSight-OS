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