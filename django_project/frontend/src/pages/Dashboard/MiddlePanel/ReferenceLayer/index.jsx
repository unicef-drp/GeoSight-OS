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
import { ArrowDownwardIcon } from "../../../../components/Icons";

import './style.scss';
import { dictDeepCopy } from "../../../../utils/main";

/**
 * Reference layer.
 * Contains level selector.
 */
export default function ReferenceLayerSection() {
  const dispatch = useDispatch();
  const {
    levelConfig
  } = useSelector(state => state.dashboard.data)
  const { referenceLayers } = useSelector(state => state.map)
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)

  // Get level list for dropdown
  // If it has the same levels from multiple dataset
  // Append the level name with /
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  let levels = null
  referenceLayers.map(referenceLayer => {
    let datasetLevels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels
    if (datasetLevels) {
      datasetLevels = dictDeepCopy(datasetLevels)
      if (!levels) {
        levels = datasetLevels
      } else {
        datasetLevels.map(level => {
          if (!levels[level.level]) {
            levels[level.level] = level
          } else {
            levels[level.level].level_name += ' / ' + level.level_name
          }
        })
      }
    }
  });

  let {
    default_level: defaultLevel,
    levels: availableLevels
  } = levelConfig

  if (selectedIndicatorLayer?.level_config?.default_level !== undefined) {
    defaultLevel = selectedIndicatorLayer?.level_config?.default_level
  }

  if (selectedIndicatorLayer?.level_config?.levels !== undefined) {
    availableLevels = selectedIndicatorLayer?.level_config?.levels
  }

  // Filter the levels
  if (levels && availableLevels) {
    levels = levels.filter(level => availableLevels.includes(level.level))
  }

  // Onload for default checked and the layer
  useEffect(() => {
    if (levels && levels[0]) {
      if ([undefined, null].includes(selectedAdminLevel?.level)) {
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
  }, [referenceLayerData, selectedAdminLevel, levels])

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
            <ArrowDownwardIcon/>
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