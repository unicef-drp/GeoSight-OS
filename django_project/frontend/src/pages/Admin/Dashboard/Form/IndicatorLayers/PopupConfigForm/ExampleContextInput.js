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

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getContext,
  updateCurrent
} from "../../../../../Dashboard/MapLibre/Layers/ReferenceLayer/Popup";
import { Select } from "../../../../../../components/Input";

import './style.scss';
import {
  referenceLayerIndicatorLayer
} from "../../../../../../utils/indicatorLayer";

/*** Popup Config Form ***/
export default function ExampleContextInput(
  {
    context, setContext, currentIndicatorLayer
  }) {
  const {
    referenceLayer: referenceLayerDashboard,
    indicatorLayers,
    indicators,
    relatedTables
  } = useSelector(state => state.dashboard.data);
  const referenceLayer = referenceLayerIndicatorLayer(referenceLayerDashboard, currentIndicatorLayer)
  const referenceLayerData = useSelector(state => state.referenceLayerData[referenceLayer?.identifier]);
  const geometries = useSelector(state => state.datasetGeometries[referenceLayer?.identifier]);
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
  const selectedGlobalTimeConfig = useSelector(state => state.selectedGlobalTimeConfig);

  const [contextData, setContextData] = useState(
    JSON.stringify(context, null, 2)
  )
  const [levelSelected, setLevelSelected] = useState(null)
  const [conceptUUID, setConceptUUID] = useState(null)
  const datasetLevels = referenceLayerData?.data?.dataset_levels;
  const selectedGeometries = geometries ? geometries[levelSelected?.value] : null

  // When reference layer changed, fetch reference data
  useEffect(() => {
    if (datasetLevels) {
      setLevelSelected({
        value: datasetLevels[0]?.level,
        label: datasetLevels[0]?.level_name
      })
    }
  }, [referenceLayerData]);

  // When reference layer changed, fetch reference data
  useEffect(() => {
    if (levelSelected !== null && selectedGeometries) {
      const concept_uuid = Object.keys(selectedGeometries)[0]
      setConceptUUID({
        value: concept_uuid,
        label: selectedGeometries[concept_uuid]?.label
      })
    }
  }, [levelSelected, selectedGeometries]);

  // When reference layer changed, fetch reference data
  useEffect(() => {
    if (conceptUUID) {
      setContextData('loading')

      // Fetch drilldown
      const featureProperties = selectedGeometries[conceptUUID.value];
      if (featureProperties) {
        let geometryProperties = {
          name: featureProperties.label,
          geom_code: featureProperties.ucode,
          admin_level: levelSelected.value,
          admin_level_name: levelSelected.label,
          concept_uuid: featureProperties.concept_uuid,
        }
        getContext(
          indicators, relatedTables,
          {}, {},
          featureProperties.concept_uuid, geometryProperties,
          selectedGlobalTime, selectedGlobalTimeConfig,
          indicatorLayers, referenceLayerData,
          currentIndicatorLayer, {},
          function contextOnLoad(context) {
            const indicatorValueByGeometry = {}
            indicatorValueByGeometry[featureProperties.concept_uuid] = []
            currentIndicatorLayer.indicators.map(indicator => {
              let data = context.context.admin_boundary.indicators[indicator.shortcode]
              if (data) {
                data = data[0]
                data.date = data?.time
                data.indicator = indicator
                indicatorValueByGeometry[featureProperties.concept_uuid].push({ ...indicator, ...data })
              } else {
                indicatorValueByGeometry[featureProperties.concept_uuid].push({ ...indicator })
              }
            })
            updateCurrent(
              context, indicators, relatedTables,
              currentIndicatorLayer, {},
              indicatorValueByGeometry, {},
              featureProperties.concept_uuid
            )
            setContextData(JSON.stringify(context, null, 2))
            setContext(context)
          },
          function contextOnError(context) {
            setContextData(context)
          }
        )
      }
    }
  }, [conceptUUID]);

  return <div className='indicator-layer context'>
    <div className='title'>
      <div>
        Example context.
        Select admin level and the geometry to fetch the actual context.
      </div>
      {
        !datasetLevels ? 'Loading' :
          <Select
            options={datasetLevels.map(level => {
              return { value: level.level, label: level.level_name }
            })}
            value={levelSelected}
            onChange={(evt) => {
              setLevelSelected(evt)
            }}/>
      }
      {
        !geometries || !geometries[levelSelected?.value] ? 'Loading' :
          <Select
            options={Object.keys(selectedGeometries).map(concept_uuid => {
              return {
                value: concept_uuid,
                label: selectedGeometries[concept_uuid]?.label
              }
            })}
            value={conceptUUID}
            onChange={(evt) => {
              setConceptUUID(evt)
            }}/>
      }
    </div>
    <div className='content textarea'>
        <textarea
          value={contextData}
          onChange={(value) => {
            setContextData(value.target.value)
          }}/>
    </div>
  </div>
}