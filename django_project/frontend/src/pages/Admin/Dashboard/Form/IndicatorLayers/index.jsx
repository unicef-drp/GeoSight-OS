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

import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import { IndicatorStyle } from './IndicatorStyle'
import MultiIndicatorConfig from "./MultiIndicator";
import RelatedTableLayerConfig from "./RelatedTable";
import DynamicIndicatorConfig from "./DynamicIndicator";
import { dictDeepCopy } from "../../../../../utils/main";
import {
  removeChildInGroupInStructure
} from "../../../../../components/SortableTreeForm/utilities";
import {
  DynamicIndicatorType,
  isIndicatorLayerLikeIndicator,
  MultiIndicatorType,
  RelatedTableLayerType,
  SingleIndicatorType
} from "../../../../../utils/indicatorLayer";

import './style.scss';

/**
 * Indicator Layer Type Selection
 * @param {boolean} open Is open or close.
 * @param {Function} setOpen Set Parent Open.
 * @param {Function} onSelected On selected data.
 */
export function IndicatorLayerConfig(
  {
    open, setOpen, onSelected,
    indicators, relatedTables, referenceLayer
  }) {

  const onClosed = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="ModalSelection IndicatorLayerCreateTypeSelection"
      >
        <ModalHeader onClosed={onClosed}>
          Add new widget
        </ModalHeader>
        <ModalContent>
          <div
            className={'ModalSelection-Option ' + (indicators.length > 0 ? 'Enabled' : '')}
            onClick={() => {
              if (indicators.length > 0) {
                onSelected(SingleIndicatorType)
                onClosed()
              }
            }}>
            <b className='light'>Single Indicator Layer</b>
            <div className='helptext'>
              Select multiple indicator on the list and turn each of it as
              single indicator layer.
            </div>
          </div>
          <div
            className={'ModalSelection-Option ' + (indicators.length > 1 ? 'Enabled' : '')}
            onClick={() => {
              if (indicators.length > 1) {
                onSelected(MultiIndicatorType)
                onClosed()
              }
            }}>
            <b className='light'>Multi Indicators Layer</b>
            <div className='helptext'>
              Select 2 or more indicators and turn all of it as single
              indicator layer.
            </div>
          </div>
          <div
            className={'ModalSelection-Option ' + (relatedTables.length > 0 && referenceLayer.identifier ? 'Enabled' : '')}
            onClick={() => {
              if (relatedTables.length > 0 && referenceLayer.identifier) {
                onSelected(RelatedTableLayerType)
                onClosed()
              }
            }}>
            <b className='light'>Related Table Layer</b>
            {
              referenceLayer.identifier ? '' : <div className='helptext error'>
                This is disabled, please select reference layer to enable it.
              </div>
            }
            <div className='helptext'>
              Create indicator layer from related table.
            </div>
          </div>
          <div
            className={'ModalSelection-Option ' + (indicators.length ? 'Enabled' : '')}
            onClick={() => {
              if (indicators.length) {
                onSelected(DynamicIndicatorType)
                onClosed()
              }
            }}>
            <b className='light'>Dynamic Indicators Layer</b>
            <div className='helptext'>
              Create dynamic indicator layer using custom expression and user
              feedback.
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  )
}

/**
 * Indicator Layers Tab dashboard
 */
export default function IndicatorLayersForm() {
  const dispatch = useDispatch();
  const {
    indicators: dashboardIndicators,
    relatedTables: dashboardRelatedTables,
    indicatorLayers,
    indicatorLayersStructure,
    referenceLayer
  } = useSelector(state => state.dashboard.data);
  const indicators = dictDeepCopy(dashboardIndicators, true)
  const relatedTables = dictDeepCopy(dashboardRelatedTables, true)

  // Handling for create layer
  const [groupName, setGroupName] = useState(false)

  // Config modal
  const [indicatorDataSelectionOpen, setIndicatorDataSelectionOpen] = useState(false)
  const [indicatorLayerConfigOpen, setIndicatorLayerConfigOpen] = useState(false)
  const [multiIndicatorStyleOpen, setMultiIndicatorStyleOpen] = useState(false)
  const [relatedTableLayerOpen, setRelatedTableLayerOpen] = useState(false)
  const [dynamicIndicatorStyleOpen, setDynamicIndicatorStyleOpen] = useState(false)

  // When the indicator layer type selected
  const IndicatorLayerTypeSelection = (type) => {
    switch (type) {
      case SingleIndicatorType: {
        setIndicatorDataSelectionOpen(true)
        break
      }
      case MultiIndicatorType: {
        setMultiIndicatorStyleOpen(true)
        break
      }
      case RelatedTableLayerType: {
        setRelatedTableLayerOpen(true)
        break
      }
      case DynamicIndicatorType: {
        setDynamicIndicatorStyleOpen(true)
        break
      }
    }
  }

  // Remove layer if the indicator is removed
  useEffect(() => {
    const indicatorIds = dashboardIndicators.map(indicator => indicator.id)
    const relatedTableIds = dashboardRelatedTables.map(rt => rt.id)
    indicatorLayers.map(layer => {
      const indicators = layer.indicators.filter(
        indicator => indicatorIds.includes(indicator.id)
      )
      const relatedTables = layer.related_tables.filter(
        rt => relatedTableIds.includes(rt.id)
      )
      // If it is multi indicator and just remaining 1 indicator, remove it
      if (indicators.length === 1 && layer.indicators.length >= 2) {
        removeLayer(layer)
      }
      // Update indicators when the size is different
      if (indicators.length !== layer.indicators.length) {
        layer.indicators = indicators
      }
      if (relatedTables.length !== layer.related_tables.length) {
        layer.related_tables = relatedTables
      }

      // delete or update
      if (layer.indicators.length === 0 && layer.related_tables.length === 0 && !isIndicatorLayerLikeIndicator(layer)) {
        removeLayer(layer)
      } else {
        dispatch(Actions.IndicatorLayers.update(layer))
      }
    })
  }, [dashboardIndicators, dashboardRelatedTables])

  /** Change indicator data format to indicator layer data. **/
  const indicatorToIndicatorLayer = (layer) => {
    return {
      name: layer.name,
      visible_by_default: false,
      group: groupName,
      description: layer.description,
      rules: layer.rules,
      type: layer.type,
      indicators: [{
        id: layer.id,
        name: layer.name,
        color: null
      }]
    }
  }


  /** Remove layer **/
  const removeLayer = (layer) => {
    removeChildInGroupInStructure(layer.group, layer.id, indicatorLayersStructure, _ => {
      dispatch(
        Actions.Dashboard.updateStructure(
          'indicatorLayersStructure', indicatorLayersStructure
        )
      )
    })
    dispatch(Actions.IndicatorLayers.remove(layer))
  }

  return <Fragment>
    <ListForm
      pageName={'Indicator Layers'}
      data={
        indicatorLayers.map(layer => {
          layer.trueId = -1
          return layer
        })
      }
      dataStructure={indicatorLayersStructure}
      setDataStructure={structure => {
        dispatch(
          Actions.Dashboard.updateStructure('indicatorLayersStructure', structure)
        )
      }}
      defaultListData={indicators}
      addLayerAction={(layer, group) => {
        dispatch(
          Actions.IndicatorLayers.add(
            indicatorToIndicatorLayer(layer)
          )
        )
      }}
      removeLayerAction={removeLayer}
      changeLayerAction={(layer) => {
        dispatch(Actions.IndicatorLayers.update(layer))
      }}
      addLayerInGroupAction={(groupName) => {
        setGroupName(groupName)
        setIndicatorLayerConfigOpen(true)
      }}

      /* For data selection */
      openDataSelection={indicatorDataSelectionOpen}
      setOpenDataSelection={setIndicatorDataSelectionOpen}
      otherActionsFunction={(layer) => {
        if (layer.type === DynamicIndicatorType) {
          return <div className='OtherActionFunctionsWrapper'>
            <div className='LayerCountIndicatorWrapper'>
              <div className='Separator'></div>
              <div className='LayerCountIndicator'>Dynamic</div>
            </div>
            <DynamicIndicatorConfig
              key={layer.id}
              indicators={indicators}
              indicatorLayer={layer}
              onUpdate={
                (layer) => {
                  dispatch(Actions.IndicatorLayers.update(layer))
                }
              }/>
          </div>
        } else if (layer.indicators.length === 1) {
          // If it is single indicator
          const indicator = indicators.find(indicatorData => {
            return indicatorData.id === layer.indicators[0].id
          })
          if (indicator) {
            return <div className='OtherActionFunctionsWrapper'>
              <div className='LayerCountIndicatorWrapper'>
                <div className='Separator'></div>
                <div className='LayerCountIndicator'>Single</div>
              </div>
              <IndicatorStyle indicator={indicator} indicatorLayer={layer}/>
            </div>
          }
        } else if (layer.related_tables?.length) {
          // If it is single indicator
          const rt = dashboardRelatedTables.find(rt => {
            return rt.id === layer.related_tables[0].id
          })
          if (rt) {
            return <div className='OtherActionFunctionsWrapper'>
              <div className='LayerCountIndicatorWrapper'>
                <div className='Separator'></div>
                <div className='LayerCountIndicator'>Related Table</div>
              </div>
              <RelatedTableLayerConfig
                key={layer.id}
                referenceLayerUUID={referenceLayer.identifier}
                relatedTables={relatedTables}
                layer={layer}
                onUpdate={
                  (layer) => {
                    dispatch(
                      Actions.IndicatorLayers.update(layer)
                    )
                  }
                }/>
            </div>
          }
        } else {
          // If it is multi indicator
          return <div className='OtherActionFunctionsWrapper'>
            <div className='LayerCountIndicatorWrapper'>
              <div className='Separator'></div>
              <div className='LayerCountIndicator'>
                {layer.indicators.length + ' Layers (' + (layer.multi_indicator_mode) + ')'}
              </div>
            </div>
            <MultiIndicatorConfig
              indicators={indicators}
              indicatorLayer={layer}
              onUpdate={
                (layer) => {
                  dispatch(Actions.IndicatorLayers.update(layer))
                }
              }/>
          </div>
        }
        return ""
      }}
    />

    {/* INDICATOR LAYER LIST OF LAYER TYPE SELECTION */}
    <IndicatorLayerConfig
      open={indicatorLayerConfigOpen}
      setOpen={setIndicatorLayerConfigOpen}
      onSelected={IndicatorLayerTypeSelection}
      indicators={indicators}
      relatedTables={relatedTables}
      referenceLayer={referenceLayer}
    />

    {/* THIS IS FOR MULTI INDICATOR CONFIG */}
    <MultiIndicatorConfig
      multiIndicatorStyleOpen={multiIndicatorStyleOpen}
      setMultiIndicatorStyleOpen={setMultiIndicatorStyleOpen}
      indicators={indicators}
      onUpdate={
        (layer) => {
          layer.group = groupName
          dispatch(
            Actions.IndicatorLayers.add(
              JSON.parse(JSON.stringify(layer))
            )
          )
        }
      }
    />

    {/* THIS IS FOR DYNAMIC INDICATOR CONFIG */}
    <DynamicIndicatorConfig
      openGlobal={dynamicIndicatorStyleOpen}
      setOpenGlobal={setDynamicIndicatorStyleOpen}
      indicators={indicators}
      onUpdate={
        (layer) => {
          layer.group = groupName
          dispatch(
            Actions.IndicatorLayers.add(
              JSON.parse(JSON.stringify(layer))
            )
          )
        }
      }
    />

    {/* THIS IS FOR RELATED TABLE CONFIG */}
    {
      referenceLayer.identifier ?
        <RelatedTableLayerConfig
          referenceLayerUUID={referenceLayer.identifier}
          configOpen={relatedTableLayerOpen}
          setConfigOpen={setRelatedTableLayerOpen}
          relatedTables={relatedTables}
          onUpdate={
            (layer) => {
              layer.group = groupName
              dispatch(
                Actions.IndicatorLayers.add(
                  JSON.parse(JSON.stringify(layer))
                )
              )
            }
          }/> : null
    }
  </Fragment>
}