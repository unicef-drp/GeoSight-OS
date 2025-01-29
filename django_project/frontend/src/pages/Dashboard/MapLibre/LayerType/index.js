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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { Marker } from "maplibre-gl";
import { jsonToUrlParams, stringToUrlAndParams } from "../../../../utils/main";
import { addPopup, addPopupEl, hasLayer, hasSource } from "../utils";

export { default as arcGisLayer } from "./ArcGis";

/**
 * Symbol layers as marker
 * This is to prevent CORS error
 */
export function symbolLayers(map, id, geojson, popupRenderFn) {
  const markers = []
  geojson?.features?.map(feature => {
    const icon = feature.properties.icon;
    if (icon && feature.geometry.type === 'Point') {
      var el = document.createElement('div');
      el.classList.add("IconMarker");
      el.style.backgroundImage = `url(${icon})`;

      // create the popup
      var marker = new Marker(el, {
        anchor: 'bottom',
        offset: [10, 30]
      }).setLngLat(feature.geometry.coordinates).addTo(map);
      addPopupEl(
        map, marker.getElement(),
        feature.geometry.coordinates, feature.properties, popupRenderFn
      )
      markers.push(marker)
    }
  });
  return markers
}

/***
 * Render geojson layer
 */
export function geojsonLayer(map, id, geojson, popupFeature) {
  const idFill = id + '-fill'
  if (!hasSource(map, id)) {
    map.addSource(id, {
      'type': 'geojson',
      'data': geojson
    });
  }
  if (!hasLayer(map, idFill)) {
    map.addLayer(
      {
        'id': idFill,
        'type': 'fill',
        'source': id,
        'paint': {
          'fill-color': '#ff7800',
          'fill-opacity': 0.6
        },
        'filter': ['==', '$type', 'Polygon']
      }
    );
    addPopup(map, idFill, popupFeature)
  }
  return symbolLayers(map, id, geojson, popupFeature)
}

/***
 * Render geojson layer
 */
export function rasterTileLayer(map, id, data) {
  const parameters = Object.assign({}, {}, data.parameters)
  parameters['type'] = `raster`;
  parameters['maxZoom'] = maxZoom;
  parameters['maxNativeZoom'] = 19;
  if (!parameters['tileSize']) {
    parameters['tileSize'] = 256;
  }
  const [url, params] = stringToUrlAndParams(data.url)
  const parameter = jsonToUrlParams(Object.assign({}, {
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: true,
    SRS: 'EPSG:3857',
    WIDTH: 512,
    HEIGHT: 512,
    bbox: '{bbox-epsg-3857}',
  }, data.parameters, params))
  parameters['tiles'] = [[url, parameter].join('?')];
  if (!hasSource(map, id)) {
    map.addSource(id, parameters);
  }
  if (!hasLayer(map, id)) {
    map.addLayer(
      {
        ...parameters,
        id: id,
        source: id,
      }
    );
  }
}