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

import React, { Fragment, useRef, useState } from 'react';
import { useSelector } from "react-redux";
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
import { ProjectCheckpoint } from "../../../../components/ProjectCheckpoint";
import { DjangoRequests } from "../../../../Requests";

import './style.scss';

/**
 * Embed component.
 */
export default function Embed({ map }) {
  // Project point states
  const projectCheckpointRef = useRef(null);
  const [projectCheckpointEnable, setProjectCheckpointEnable] = useState(false)

  const dashboardData = useSelector(state => state.dashboard.data);
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [data, setData] = useState({
    layer_tab: true,
    filter_tab: true,
    map: true,
    widget_tab: true,
  })

  /**
   * Save function based on url
   */
  const save = async () => {
    const _data = projectCheckpointRef.current.getData();
    setCode('Generating')
    try {
      const response = await DjangoRequests.post(
        urls.embedDetail,
        { ...data, ..._data }
      )
      setCode(`${domain()}/embed/${response.data.code}`)
    } catch (err) {
      setCode(err.toString())
    }
  }


  if (!dashboardData.id || !urls.embedDetail) {
    return ""
  }
  return (
    <Fragment>
      <ProjectCheckpoint
        map={map}
        setProjectCheckpointEnable={setProjectCheckpointEnable}
        ref={projectCheckpointRef}
      />
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
          <b>Create embed snippet for this map.</b>
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
            disabled={code === 'Generating' || !projectCheckpointEnable}
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
    </Fragment>
  )
}