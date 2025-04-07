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
export let indicatorLayersForcedUpdateIds = null
export const changeIndicatorLayersForcedUpdate = (ids) => {
  indicatorLayersForcedUpdateIds = ids
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
  const [currentIndicatorLayers, setCurrentIndicatorLayers] = useState([0, 0])
  const currentIndicatorLayer = currentIndicatorLayers[0]
  const currentIndicatorSecondLayer = currentIndicatorLayers[1]

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
      setCurrentIndicatorLayers([currentIndicatorLayer, 0])
      dispatch(Actions.SelectedIndicatorSecondLayer.change({}))
    }
  }, [compareMode]);

  const updateOtherLayers = (selectedData) => {
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
  /**
   * Init the current indicator layer
   */
  useEffect(() => {
    let indicatorLayersTree = JSON.parse(JSON.stringify(indicatorLayers))
    let selectedIds = [currentIndicatorLayer, currentIndicatorSecondLayer]
    if (indicatorLayersTree && indicatorLayersTree.length) {
      // Indicator enabled
      const indicatorLayersIds = []
      indicatorLayers.map(layer => {
        indicatorLayersIds.push(layer.id)
        indicatorLayersIds.push('' + layer.id)
      })
      // Assign to selected ids
      if (!indicatorLayersIds.includes(currentIndicatorLayer)) {
        selectedIds[0] = null
      }
      if (!indicatorLayersIds.includes(currentIndicatorSecondLayer)) {
        selectedIds[1] = null
      }

      // Get the force update ids
      if (indicatorLayersForcedUpdateIds !== null) {
        selectedIds = indicatorLayersForcedUpdateIds
      }
      indicatorLayersForcedUpdateIds = null

      if (selectedIds[0] == null) {
        selectedIds = indicatorLayersTree.filter(indicator => {
          return indicator.visible_by_default
        }).map(indicator => indicator.id)
      }

      // Check default indicator as turned one
      if (currentIndicatorLayer !== selectedIds[0]) {
        if (!selectedIds[0]) {
          indicatorLayersTree[0].visible_by_default = true
          selectedIds[0] = indicatorLayersTree[0].id
        }
      } else {
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
          if (!indicator) {
            indicatorLayer.error = "There is no indicator found for this layer. Please ask admin to fix this."
          } else if (!indicator.permission.read_data) {
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
    } else {
      onChange([])
    }
    setTreeData(
      [
        ...dataStructureToTreeData(indicatorLayersTree, indicatorLayersStructure)
      ]
    )

    // Setup current indicator layer
    setCurrentIndicatorLayers(selectedIds)
    updateCurrentIndicator(selectedIds[0], Actions.SelectedIndicatorLayer)
    updateCurrentIndicator(selectedIds[1], Actions.SelectedIndicatorSecondLayer)
    updateOtherLayers(['' + selectedIds[0], '' + selectedIds[1]])
  }, [indicatorLayers, relatedTableData, indicatorLayersStructure]);

  const onChange = (selectedData) => {
    if (selectedData.length === 0) {
      if (currentIndicatorLayer) {
        setCurrentIndicatorLayers([0, 0])
        dispatch(Actions.SelectedIndicatorLayer.change({}))
      }
    }
    if (selectedData.length >= 1) {
      setCurrentIndicatorLayers(selectedData)
    }

    updateOtherLayers(selectedData)
  }

  return (
    <Fragment>
      <SidePanelTreeView
        data={treeData}
        selectable={true}
        resetSelection={true}
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
    <>
      <Accordion
        expanded={expanded}
        className={'IndicatorLayerList'}
      >

        <AccordionDetails>
          <IndicatorLayers/>
        </AccordionDetails>
      </Accordion>
    </>
  )
}