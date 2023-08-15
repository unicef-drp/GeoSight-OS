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
   INDICATOR LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from "@mui/material/Accordion";
import sqlParser from "js-sql-parser";

import { Actions } from '../../../../store/dashboard'
import {
  dataStructureToTreeData
} from "../../../../components/SortableTreeForm/utilities";
import SidePanelTreeView from "../../../../components/SidePanelTree";
import { returnWhereToDict } from "../../../../utils/queryExtraction";
import RelatedTableLayer, {
  RelatedTableLayerFilter
} from "./RelatedTableLayer";
import DynamicIndicatorLayer, {
  DynamicIndicatorLayerConfig
} from "./DynamicIndicatorLayer";
import { DynamicIndicatorType } from "../../../../utils/indicatorLayer";

import './style.scss';


/** Force indicator layer to update **/
export let indicatorLayersForcedUpdate = false
export const changeIndicatorLayersForcedUpdate = (force) => {
  indicatorLayersForcedUpdate = force
}


/**
 * Indicators selector.
 */
export function IndicatorLayers() {
  const dispatch = useDispatch()
  const {
    indicators,
    indicatorLayers,
    indicatorLayersStructure,
    relatedTables
  } = useSelector(state => state.dashboard.data)
  const [currentIndicatorLayer, setCurrentIndicatorLayer] = useState(0)
  const [currentIndicatorSecondLayer, setCurrentIndicatorSecondLayer] = useState(0)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const { compareMode } = useSelector(state => state.mapMode)
  const [treeData, setTreeData] = useState([])

  /** Update current indicator **/
  const updateCurrentIndicator = (indicatorID, Action) => {
    const indicator = indicatorLayers.filter(indicator => {
      return ('' + indicator.id) === ('' + indicatorID)
    })[0]
    if (indicator) {
      const indicatorData = JSON.parse(JSON.stringify(indicator))
      if (!indicatorData.style?.length) {
        indicatorData.style = indicators.find(indicator => {
          return indicator.id === indicatorData.indicators[0]?.id
        })?.style
      }
      dispatch(Action.change(indicatorData))
    }
  }

  const updateDescription = (indicatorLayer, relatedTableConfig) => {
    const [aggrMethod, aggrField] = indicatorLayer.config.aggregation.replace(')', '')
      .split('(');

    let fields;
    try {
      const parsed = sqlParser.parse(
        `SELECT *
         FROM test
         WHERE ${relatedTableConfig.query}`);
      const parsedQuery = returnWhereToDict(parsed.value.where);
      fields = Array.isArray(parsedQuery) ? parsedQuery.map(query => query.field) : [parsedQuery.field];
    } catch (error) {
      fields = [];
    }

    return indicatorLayer.description
      .replace('{aggr-method-name}', aggrMethod)
      .replace('{aggr-field-name}', aggrField)
      .replace('{related-table-name}', relatedTableConfig.name)
      .replace('{sql-field-names}', fields.join(', '))
      .replace('{sql-query}', relatedTableConfig.query)
  }

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    updateCurrentIndicator(currentIndicatorLayer, Actions.SelectedIndicatorLayer)
  }, [currentIndicatorLayer]);

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    updateCurrentIndicator(currentIndicatorSecondLayer, Actions.SelectedIndicatorSecondLayer)
  }, [currentIndicatorSecondLayer]);

  /**
   * Change selected indicator layer
   */
  useEffect(() => {
    if (!compareMode) {
      setCurrentIndicatorSecondLayer(0)
      dispatch(Actions.SelectedIndicatorSecondLayer.change({}))
    }
  }, [compareMode]);
  /**
   * Init the current indicator layer
   */
  useEffect(() => {
    let indicatorLayersTree = JSON.parse(JSON.stringify(indicatorLayers))
    if (indicatorLayersTree && indicatorLayersTree.length) {

      // Indicator enabled
      let indicatorEnabled = { 'id': currentIndicatorLayer }
      if (!indicatorEnabled.id || indicatorLayersForcedUpdate) {
        // If not force updated
        indicatorEnabled = indicatorLayersTree.find(indicator => {
          return indicator.visible_by_default
        })
      }
      indicatorLayersForcedUpdate = false

      // Check default indicator as turned one
      if (currentIndicatorLayer !== indicatorEnabled?.id) {
        // Change current indicator if indicators changed
        if (indicatorEnabled) {
          setCurrentIndicatorLayer(indicatorEnabled.id)
        } else {
          indicatorLayersTree[0].visible_by_default = true
          setCurrentIndicatorLayer(indicatorLayersTree[0].id)
        }
      } else {
        const selectedIds = [currentIndicatorLayer, currentIndicatorSecondLayer]
        // Change visible by default
        indicatorLayersTree.map(indicator => {
          if (selectedIds.includes(indicator.id)) {
            indicator.visible_by_default = true
          } else {
            indicator.visible_by_default = false
          }
        })
      }

      // Check permission
      indicatorLayersTree.map(indicatorLayer => {
        // Check indicators
        indicatorLayer.indicators.map(indLy => {
          const indicator = indicators.find(indicator => indicator.id === indLy.id)
          if (!indicator.permission.read) {
            indicatorLayer.error = "You don't have permission to access this resource"
          }
        })

        // Check related tables
        indicatorLayer.related_tables.map(rt => {
          const rtConfig = relatedTables.find(rtConfig => rtConfig.id === rt.id)
          if (!rtConfig) {
            indicatorLayer.error = "Related table does not configured properly"
          } else {
            indicatorLayer.description = updateDescription(indicatorLayer, rtConfig)
            if (!rtConfig.permission.read_data) {
              indicatorLayer.error = "You don't have permission to access this resource"
            }
            if (relatedTableData[rt.id]?.fetching) {
              indicatorLayer.loading = true
            } else if (relatedTableData[rt.id]?.error) {
              indicatorLayer.error = relatedTableData[rt.id]?.error
            }
          }
        })
      })
    }
    setTreeData(
      [
        ...dataStructureToTreeData(indicatorLayersTree, indicatorLayersStructure)
      ]
    )

    // Setup current indicator layer
    updateCurrentIndicator(currentIndicatorLayer, Actions.SelectedIndicatorLayer)
    updateCurrentIndicator(currentIndicatorSecondLayer, Actions.SelectedIndicatorSecondLayer)
  }, [indicatorLayers, relatedTableData]);

  const onChange = (selectedData) => {
    if (selectedData.length === 0) {
      if (currentIndicatorLayer) {
        setCurrentIndicatorLayer(0)
        dispatch(Actions.SelectedIndicatorLayer.change({}))
      }
    }
    if (selectedData.length > 0) {
      setCurrentIndicatorLayer(selectedData[0])
    }
    if (selectedData.length > 1) {
      setCurrentIndicatorSecondLayer(selectedData[1])
    } else {
      if (compareMode) {
        setCurrentIndicatorSecondLayer(0)
        dispatch(Actions.SelectedIndicatorSecondLayer.change({}))
      }
    }

    // Check selected indicator layers
    const selectedIndicatorLayers = indicatorLayers.filter(layer => selectedData.includes('' + layer.id))
    let relatedLayer = null
    let dynamicLayer = null
    selectedIndicatorLayers.map(layer => {
      if (layer.related_tables?.length && layer.config.where) {
        relatedLayer = layer.id
      } else if (layer.type === DynamicIndicatorType) {
        dynamicLayer = layer.id
      }
    })
    dispatch(Actions.SelectedRelatedTableLayer.change(relatedLayer))
    dispatch(Actions.SelectedDynamicIndicatorLayer.change(dynamicLayer))
  }

  return (
    <Fragment>
      <SidePanelTreeView
        data={treeData}
        selectable={true}
        maxSelect={compareMode ? 2 : 1}
        onChange={onChange}
        otherInfo={(layer) => {
          if (layer.data.related_tables?.length && layer.data.config.where) {
            return <RelatedTableLayerFilter relatedTableLayer={layer.data}/>
          } else if (layer.data.type === DynamicIndicatorType) {
            return <DynamicIndicatorLayerConfig
              indicatorLayer={layer}/>
          }
          return null
        }}
        placeholder={'Search Indicators'}
      />
      {
        indicatorLayers.map(indicatorLayer => {
          if (indicatorLayer.related_tables?.length) {
            return <RelatedTableLayer
              key={indicatorLayer.id}
              relatedTableLayer={indicatorLayer}/>
          } else if (indicatorLayer.type === DynamicIndicatorType) {
            return <DynamicIndicatorLayer
              key={indicatorLayer.id}
              indicatorLayer={indicatorLayer}/>
          }
          return null
        })
      }
    </Fragment>
  )
}

/**
 * Indicators selector
 * @param {bool} expanded Is the accordion expanded
 * @param {function} handleChange Function when the accordion show
 */
export default function IndicatorLayersAccordion({ expanded }) {
  return (
    <Accordion
      expanded={expanded}
      className={'IndicatorLayerList'}
    >

      <AccordionDetails>
        <IndicatorLayers/>
      </AccordionDetails>
    </Accordion>
  )
}