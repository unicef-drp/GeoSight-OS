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
import { ArrowDownwardIcon } from "../../../../components/Icons";

import './style.scss';

let currentReferenceLayer = null
/**
 * Reference layer.
 * Contains level selector.
 */
export default function ReferenceLayerSection() {
  const dispatch = useDispatch();
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
  }, [referenceLayerData, selectedIndicatorLayer])

  // Onload for default checked and the layer
  useEffect(() => {

    let levels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels;

    // TODO:
    //  This is used for just fetching levels that is selected.
    //  But the problem is the levels can be used on the filter
    //  Commented this for now
    if (levels && availableLevels) {
      const maxLevel = Math.max(...availableLevels)
      levels = levels.filter(level => level.level <= maxLevel)
    }
    currentReferenceLayer = referenceLayer.identifier
    if (levels) {
      (
        async () => {
          const geometryUUIDByUcode = {}
          const geometryDataByLevel = {}
          for (let level of levels) {
            const geometryData = await fetchFeatureList(level.url)
            if (currentReferenceLayer !== referenceLayer.identifier) {
              return
            }
            const geometryDataDict = {}
            geometryData.map(geom => {
              const code = extractCode(geom)
              if (!code) {
                return
              }
              geom.parents.sort(function (a, b) {
                return a.admin_level < b.admin_level ? -1 : 1;
              })
              const parents = geom.parents.map(parent => geometryUUIDByUcode[parent.default]).filter(parent => !!parent)
              const memberData = {
                name: geom.name,
                ucode: geom.ucode,
                code: code,
              }
              geometryDataDict[code] = {
                label: geom.name,
                name: geom.name,
                centroid: geom.centroid,
                code: code,
                ucode: geom.ucode,
                concept_uuid: code,
                parents: parents,
                members: parents.concat(memberData),
              }
              geometryUUIDByUcode[geom.ext_codes.default] = memberData
            })
            geometryDataByLevel[level.level] = geometryDataDict
            if (currentReferenceLayer === referenceLayer.identifier) {
              dispatch(
                Actions.Geometries.addLevelData(level.level, geometryDataDict)
              )
            }
          }
        }
      )()
    }
  }, [referenceLayerData])

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