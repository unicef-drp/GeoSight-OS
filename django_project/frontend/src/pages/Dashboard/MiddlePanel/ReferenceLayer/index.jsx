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

/* ==========================================================================
   REFERENCE LAYER
   ========================================================================== */

import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";

import { Actions } from '../../../../store/dashboard'
import { extractCode, fetchFeatureList } from "../../../../utils/georepo";

import './style.scss';

/**
 * Reference layer.
 * Contains level selector.
 */
export default function ReferenceLayerSection() {
  const dispatch = useDispatch();
  const geometries = useSelector(state => state.geometries)
  const {
    referenceLayer,
    levelConfig
  } = useSelector(state => state.dashboard.data)
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)

  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  let levels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels

  let {
    default_level: defaultLevel,
    levels: availableLayers
  } = levelConfig

  if (selectedIndicatorLayer?.level_config?.default_level !== undefined) {
    defaultLevel = selectedIndicatorLayer?.level_config?.default_level
  }

  if (selectedIndicatorLayer?.level_config?.levels !== undefined) {
    availableLayers = selectedIndicatorLayer?.level_config?.levels
  }

  // Filter the levels
  if (levels && availableLayers) {
    levels = levels.filter(level => availableLayers.includes(level.level))
  }

  // Onload for default checked and the layer
  useEffect(() => {
    if (levels && levels[0]) {
      if (!selectedAdminLevel?.level) {
        if (defaultLevel) {
          onChange(defaultLevel)
        } else {
          onChange(levels[0].level)
        }
      } else {
        const level = levels.find(level => level.level === selectedAdminLevel?.level)
        if (!level) {
          onChange(levels[0].level)
        }
      }
    }
  }, [referenceLayerData, selectedIndicatorLayer])


  // Onload for default checked and the layer
  useEffect(() => {
    const defaultLevel = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels
    if (defaultLevel) {
      defaultLevel.map(level => {
        if (!geometries[level.level]) {
          (
            async () => {
              const geometryData = await fetchFeatureList(level.url)
              const geometryDataDict = {}
              geometryData.map(geom => {
                const code = extractCode(geom)
                if (!code) {
                  return
                }
                geometryDataDict[code] = {
                  label: geom.name,
                  name: geom.name,
                  centroid: geom.centroid,
                  code: code,
                  ucode: geom.ucode,
                  concept_uuid: code
                }
              })
              dispatch(
                Actions.Geometries.addLevelData(level.level, geometryDataDict)
              )
            }
          )()
        }
      })
    }
  }, [levels])

  /** Change Admin Level **/
  const onChange = (newLevel) => {
    const level = levels.find(level => level.level === newLevel)
    if (level && (!selectedAdminLevel || JSON.stringify(selectedAdminLevel) !== JSON.stringify(level))) {
      dispatch(Actions.SelectedAdminLevel.change(level))
    }
  }

  // Current level
  let level = null;
  if (levels) {
    level = levels.find(lv => lv.level === selectedAdminLevel.level)
  }

  return <div className='ReferenceLayerLevelSelector'>
    {
      levels && level ? (
        <Fragment>
          <div className='ReferenceLayerLevelSelected'>
            <div>{level.level_name}</div>
          </div>
          <div className='ReferenceLayerLevelOptions'>
            {
              Object.keys(levels).map(level => {
                return <div
                  key={level}
                  className='ReferenceLayerLevelOption'
                  onClick={() => {
                    onChange(levels[level].level)
                  }}
                >
                  {levels[level].level_name}
                </div>
              })
            }
          </div>
        </Fragment>
      ) : ""
    }
  </div>
}