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
 * __date__ = '18/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from 'react';
import { axiosGet, fetchFeatureList } from "../../../../utils/georepo";
import { Select } from "../../../../components/Input";
import { URLS } from "../../../../utils/urls";

let requestTime = null
/**
 * Reference layer geometry selector Form App
 */
export default function ReferenceLayerGeometrySelector(
  { referenceLayer, onChange }
) {
  const [level, setLevel] = useState(null)
  const [levels, setLevels] = useState(null)
  const [geometry, setGeometry] = useState(null)
  const [geometries, setGeometries] = useState(null)

  // Get reference layer detail
  useEffect(
    () => {
      if (referenceLayer) {
        setLevels(null)
        const currentDate = new Date().getTime();
        requestTime = currentDate;
        const url = URLS.ReferenceLayer.VIEW.Detail(referenceLayer)
        axiosGet(url).then(response => {
          if (requestTime === currentDate) {
            const data = response.data
            const newLevels = data.dataset_levels.map(level => {
              return {
                label: level.level_name,
                value: level.level,
                url: level.url,
              }
            })
            setLevels(newLevels)
            setLevel(newLevels[0])
          }
        });
      }
    }, [referenceLayer]
  )

  // Get feature list
  useEffect(
    () => {
      if (level) {
        setGeometries(null)
        const currentDate = new Date().getTime();
        requestTime = currentDate;
        (
          async () => {
            const geometryData = await fetchFeatureList(level.url)
            if (requestTime === currentDate) {
              const data = geometryData.map(geom => {
                return {
                  label: geom.name,
                  value: geom.concept_uuid
                }
              })
              setGeometries(data)
              setGeometry(data[0])
            }
          }
        )()
      }
    }, [level]
  )

  // Trigger onChange
  useEffect(
    () => {
      if (geometry) {
        onChange({
          level: level.value,
          concept_uuid: geometry.value,
        })
      }
    }, [geometry]
  )

  return <div>
    <Select
      options={levels ? levels : []}
      placeholder={'Loading'}
      value={level}
      onChange={(evt) => {
        if (evt) {
          setLevel(evt)
        }
      }}
    />
    <Select
      options={geometries ? geometries : []}
      placeholder={'Loading'}
      value={geometry}
      onChange={(evt) => {
        if (evt) {
          setGeometry(evt)
        }
      }}
    />
  </div>;
}