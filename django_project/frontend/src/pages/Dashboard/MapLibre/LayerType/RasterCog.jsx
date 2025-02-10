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
 * __date__ = '31/10/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */


import $ from "jquery";
import {
  addClickEvent,
  addStandalonePopup,
  getBeforeLayerId,
  hexToRgba,
  removeLayer,
  removeSource
} from "../utils";
import { createColorsFromPaletteId } from "../../../../utils/Style";
import { sleep } from "../../../../utils/main";
import { getCogFeatureByPoint } from "../../../../utils/COGLayer";
import { setColorFunction } from '@geomatico/maplibre-cog-protocol';
import { DjangoRequests } from "../../../../Requests";
import { addLayerWithOrder } from "../Render";
import { Variables } from "../../../../utils/Variables";

let sessions = {};

/***
 * Render Raster Cog
 */
export default function rasterCogLayer(map, id, data, setData, contextLayerData, popupFeatureFn, contextLayerOrder, isInit, setIsInit, requestSent, setLoading = {}) {
  (
    async () => {
      if (!data?.styles) {
        debugger
      }
      if (JSON.stringify(requestSent.current) === JSON.stringify(data?.styles)) {
        return
      }
      requestSent.current = data
      const {
        min_band,
        max_band,
        color_palette,
        color_palette_reverse,
        dynamic_class_num,
        dynamic_classification,
        additional_nodata,
        nodata_color,
        nodata_opacity,
      } = data?.styles || {};
      const additional_ndt_val = additional_nodata ? parseFloat(additional_nodata) : additional_nodata;
      const ndt_opacity = nodata_opacity ? parseFloat(nodata_opacity) : nodata_opacity;
      const colors = createColorsFromPaletteId(color_palette, dynamic_class_num, color_palette_reverse);
      let init = isInit;
      if (!colors.length) {
        return
      }

      // TODO: Handle styling when multiple, identical COG URLs are used
      let url = `cog://${data.url}?method=${dynamic_classification}#color:[${colors.map(color => '"' + color + '"')}],${min_band ? min_band : 0},${max_band ? max_band : 100},c`      //
      if (dynamic_classification != 'Equidistant.') {
        url = `cog://${data.url}#method=${dynamic_classification}`      //
        const requestBody = {
          url: data.url,
          class_type: dynamic_classification,
          class_num: dynamic_class_num,
          colors: colors,
          minumum: min_band,
          maximum: max_band
        }

        const key = id + JSON.stringify(requestBody);
        let classifications = [];

        // if classification for the request body exist, use it
        // otherwise, get it from API
        if (sessions[key]) {
          classifications = sessions[key];
        } else {
          setLoading(true)
          await DjangoRequests.post(
            `/api/raster/classification`,
            requestBody
          ).then(response => {
            response.data.forEach((threshold, idx) => {
              if (idx < response.data.length - 1) {
                classifications.push({
                  bottom: threshold,
                  top: response.data[idx + 1],
                  color: colors[idx]
                });
              }
              sessions[key] = classifications
              setLoading(false)
            });
          }).catch(error => {
            throw Error(error.toString())
          })
        }

        removeSource(map, id)

        const getColor = (value) => {
          for (const classification of classifications) {
            if (value >= classification.bottom && value < classification.top) {
              const rgbaColor = hexToRgba(classification.color, 1)
              rgbaColor[3] = parseInt((rgbaColor[3] * 255))
              return rgbaColor;
            }
          }
          return value === classifications[classifications.length - 1].top ? value : null;
        };


        setColorFunction(data.url, ([value], rgba, { noData}) => {
          if (init && colors.length > 0) {
            init = false
            if (isInit) {
              setIsInit(false)
            }
            if (setData) {
              setData({
                ...data,
                styles: {
                  ...data.styles,
                  nodata: noData.toString()
                }
              });
            }
          }
          if (value === noData || value === Infinity || isNaN(value) || value === additional_ndt_val) {
            let rgbaColor = hexToRgba(nodata_color, (ndt_opacity / 100))
            rgbaColor[3] = parseInt((rgbaColor[3] * 255))
            rgba.set(rgbaColor);
          } else if (value < min_band || value > max_band) {
            rgba.set([0, 0, 0, 0]); // noData, fillValue or NaN => transparent
          } else {
            try {
              rgba.set(getColor(value));
            } catch (e) {
              console.log(`error: ${value}`)
            }
          }
        });
      }

      removeSource(map, id)
      const sourceParams = Object.assign({}, data.params, {
        url: url,
        type: 'raster',
        tileSize: 256
      })
      map.addSource(id, sourceParams);

      // We find the before layers
      let before = null;
      if (contextLayerOrder) {
        const beforeOrder = getBeforeLayerId(map, id, contextLayerOrder)
        if (beforeOrder) {
          before = beforeOrder
        }
      }
      removeLayer(map, id)
      addLayerWithOrder(
        map,
        {
          id: id,
          source: id,
          type: 'raster'
        },
        Variables.LAYER_CATEGORY.CONTEXT_LAYER,
        before
      );

      /** Click map */
      const onClick = async (e) => {
        if (map.drawingMode) {
          return
        }
        const visibleLayerIds = map.getStyle().layers.filter(layer => layer.id.includes('gl-draw-polygon')).map(layer => layer.id)
        const features = map.queryRenderedFeatures(
          e.point, { layers: visibleLayerIds }
        );
        if (features.length > 0) {
          return
        }
        const isVisible = map.getStyle().layers.find(layer => layer.id === id)
        if (isVisible) {
          await sleep(100);
          if (!$('.maplibregl-popup').length) {
            const session = new Date().getTime();
            addStandalonePopup(map, e.lngLat, popupFeatureFn, { Value: 'loading' }, session)
            getCogFeatureByPoint(
              data.url, [e.lngLat.lng, e.lngLat.lat],
              (values) => {
                if ($(`.${session}`).length) {
                  addStandalonePopup(map, e.lngLat, popupFeatureFn, { Value: values.length ? values[0][0] : '-' })
                }
              }
            )
          }
        }
      }
      addClickEvent(map, null, id, onClick)
    }
  )()

}
