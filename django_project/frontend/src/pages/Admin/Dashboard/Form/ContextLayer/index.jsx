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
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import {
  SaveButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import ListForm from '../ListForm'
import StyleConfig from '../../../ContextLayer/StyleConfig'
import { CogIcon } from "../../../../../components/Icons/svg";

import './style.scss';

/**
 * Context Layer Style
 */
function ContextLayerStyle({ contextLayer }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(false);

  useEffect(() => {
    setData(JSON.parse(JSON.stringify(contextLayer)))
  }, [open])

  /** Apply the data **/
  const apply = () => {
    dispatch(Actions.ContextLayers.updateStyle(data))
    setOpen(false)
  }

  /** Update data **/
  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData)
    }
  }

  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig BasicForm ContextLayerStyleModal MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Style for {contextLayer.name}
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={
                JSON.stringify(contextLayer) === JSON.stringify(data)
              }
              onClick={apply}/>
          </div>
          <div className='AdminForm Section'>
            {
              open ? <StyleConfig
                data={data} setData={updateData}
                useOverride={true}/> : ""

            }
          </div>
        </ModalContent>
      </Modal>
      <ThemeButton className='ContextLayerStyleButton' onClick={() => {
        setOpen(true)
      }}>
        <CogIcon/> Config
      </ThemeButton>
    </Fragment>
  )
}

/**
 * Context Layer dashboard
 */
export default function ContextLayerForm() {
  const dispatch = useDispatch()
  const {
    contextLayers,
    contextLayersStructure
  } = useSelector(state => state.dashboard.data);

  return <ListForm
    pageName={'Context Layers'}
    data={contextLayers}
    dataStructure={contextLayersStructure}
    setDataStructure={structure => {
      dispatch(
        Actions.Dashboard.updateStructure('contextLayersStructure', structure)
      )
    }}
    listUrl={urls.api.contextLayerListAPI}
    addLayerAction={layer => {
      layer.default_styles = {
        data_fields: layer.data_fields,
        styles: layer.styles,
        label_styles: layer.label_styles,
      }
      dispatch(Actions.ContextLayers.add(layer))
    }}
    removeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.remove(layer))
    }}
    changeLayerAction={(layer) => {
      dispatch(Actions.ContextLayers.update(layer))
    }}
    otherActionsFunction={(contextLayer) => {
      return <ContextLayerStyle contextLayer={contextLayer}/>
    }}
  />
}