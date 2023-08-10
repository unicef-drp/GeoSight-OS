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
   Bookmark
   ========================================================================== */

import React, { useState } from 'react';
import { useSelector } from "react-redux";
import $ from "jquery";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { EmbedIcon } from '../../../../components/Icons'
import { IconTextField } from "../../../../components/Elements/Input";
import { SaveButton } from "../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";
import { domain } from "../../../../utils/main";

import './style.scss';

/**
 * Embed component.
 */
export default function Embed({ map }) {
  const dashboardData = useSelector(state => state.dashboard.data);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const {
    basemapLayer,
    contextLayers,
    extent,
    indicatorShow,
    contextLayersShow,
    is3dMode
  } = useSelector(state => state.map)
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [data, setData] = useState({
    layer_tab: true,
    filter_tab: true,
    map: true,
    widget_tab: true,
  })

  /***
   * Get data of bookmark like
   */
  const otherData = () => {
    return {
      selectedBasemap: basemapLayer?.id,
      selectedIndicatorLayer: selectedIndicatorLayer?.id,
      selectedIndicatorSecondLayer: selectedIndicatorSecondLayer?.id,
      selectedContextLayers: Object.keys(contextLayers).map(id => parseInt(id)),
      filters: dashboardData.filters,
      extent: extent,
      indicatorShow: indicatorShow,
      contextLayersShow: contextLayersShow,
      selectedAdminLevel: selectedAdminLevel.level,
      is3dMode: is3dMode,
      position: JSON.stringify({
        pitch: map?.getPitch(),
        bearing: map?.getBearing(),
        zoom: map?.getZoom(),
        center: map?.getCenter(),
      })
    }
  }

  /**
   * Save function based on url
   */
  const save = () => {
    setCode('Generating')
    $.ajax({
      url: urls.embedDetail,
      data: {
        data: JSON.stringify(Object.assign({}, data, otherData()))
      },
      type: 'POST',
      dataType: 'json',
      success: function (data, textStatus, request) {
        setCode(`${domain()}/embed/${data.code}`)
      },
      error: function (error, textStatus, errorThrown) {
        setCode(error.responseText)
      },
      beforeSend: beforeAjaxSend
    });
  }


  if (!dashboardData.id || !urls.embedDetail) {
    return ""
  }
  return (
    <div>
      <EmbedIcon onClick={_ => setOpen(true)}/>
      <Modal
        className='EmbedComponent'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Create embed snippet for this map.
        </ModalHeader>
        <ModalContent>
          <div className='AdminForm'>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.layer_tab}
                    onChange={evt => {
                      setData({ ...data, layer_tab: evt.target.checked })
                    }}/>
                }
                label="Layer Tab"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.filter_tab}
                    onChange={evt => {
                      setData({ ...data, filter_tab: evt.target.checked })
                    }}/>
                }
                label="Filter Tab"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.map}
                    onChange={evt => {
                      setData({ ...data, map: evt.target.checked })
                    }}/>
                }
                label="Map"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.widget_tab}
                    onChange={evt => {
                      setData({ ...data, widget_tab: evt.target.checked })
                    }}/>
                }
                label="Widget Tab"
              />
            </FormGroup>
          </div>
        </ModalContent>
        <ModalFooter>
          <SaveButton
            variant="primary"
            text='Generate'
            disabled={code === 'Generating'}
            onClick={() => {
              save()
            }}/>
          <IconTextField
            readOnly={true}
            iconEnd={
              <ContentCopyIcon
                className='CopyIcon' title='Copy embed code'
                onClick={evt => {
                  navigator.clipboard.writeText(code);
                }}
              />
            }
            value={code}
            inputProps={{ readOnly: true }}
          />
        </ModalFooter>
      </Modal>
    </div>
  )
}