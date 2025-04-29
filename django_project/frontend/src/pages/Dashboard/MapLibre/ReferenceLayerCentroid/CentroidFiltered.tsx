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
 * __date__ = '28/04/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
import maplibregl from "maplibre-gl";
import { hasLayer } from "../utils";
import { INDICATOR_LABEL_ID } from "./Label";
import { IS_DEBUG, Logger } from "../../../../utils/logger";

const geo_field = 'concept_uuid'

interface Props {
  map: maplibregl.Map;
}

/** GeometryCenter. */
export const ReferenceLayerFilterCentroid = forwardRef(
  ({ map }: Props, ref
  ): null => {
    // @ts-ignore
    const filteredGeometries = useSelector(state => state.filteredGeometries)

    /*** UPDATE FILTER OF LAYER */
    const updateFilter = () => {
      const codes = filteredGeometries
      if (hasLayer(map, INDICATOR_LABEL_ID)) {
        if (codes) {
          // @ts-ignore
          map.setFilter(INDICATOR_LABEL_ID, ['in', geo_field].concat(codes));
        } else {
          map.setFilter(INDICATOR_LABEL_ID, null);
        }
      }
      // For chart
      if (!codes) {
        $('.centroid-chart').show()
      } else {
        $('.centroid-chart').hide()
        codes.map((code: string) => {
          $(`#${code}-wrapper`).show()
          $(`#${code}-pin`).show()
        })
      }

      // LOG THE LABELS
      if (IS_DEBUG) {
        setTimeout(function () {
          const features = map.queryRenderedFeatures({
            layers: [INDICATOR_LABEL_ID]
          });
          const output = features.sort(
            (a, b) => {
              try {
                return a.properties.geometry_code.localeCompare(b.properties.geometry_code)
              } catch (err) {
                return false
              }

            }
          ).map(
            feature => [
              feature.properties.name, feature.properties.code, feature.properties.date, feature.properties.label, feature.properties.value
            ]
          )

          Logger.log('LABEL_GEOM:', output)
        }, 500);
      }
    }

    // Ready check
    useImperativeHandle(ref, () => ({
      call() {
        updateFilter()
      }
    }));

    // When everything changed
    useEffect(() => {
      updateFilter()
    }, [filteredGeometries]);

    return null;
  }
)