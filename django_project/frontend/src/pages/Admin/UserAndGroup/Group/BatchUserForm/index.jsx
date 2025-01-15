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
 * __date__ = '23/04/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import $ from "jquery";
import { FormControl } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import Modal, { ModalHeader } from "../../../../../components/Modal";
import { SaveButton } from "../../../../../components/Elements/Button";
import CancelIcon from '@mui/icons-material/Cancel';
import './style.scss';
import { DjangoRequests } from "../../../../../Requests";

/**
 * Batch user form for group
 */
export const BatchUserForm = forwardRef(
  (
    { data }, ref
  ) => {
    const [state, setState] = useState()
    const [open, setOpen] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [updated, setUpdated] = useState(false)
    const [payload, setPayload] = useState({})
    const [error, setError] = useState('')

    useImperativeHandle(ref, () => ({
      open(data) {
        setOpen(true)
      }
    }));

    /** Submit file **/
    const submit = () => {
      var formData = new FormData()
      const file = $('#BatchUserFormFile')[0].files[0];
      formData.append('file', file)
      setUpdating(true)
      setUpdated(false)

      DjangoRequests.post(
        `/api/v1/groups/${data.id}/user_batch/`,
        formData, {}, {
          'Content-Type': 'multipart/form-data'
        }
      ).then(response => {
        setUpdating(false)
        setUpdated(true)
      }).catch(err => {
        setUpdating(false)
        setError(err.response.data)
      })
    }

    return <Modal
      className='BatchUserFormModal'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Update user for {data.name} in batch using csv file.
        <br/>
        <span className='helptext'>
          You can get the csv file in <a href={urls.statics.sample}>here</a>.
        </span>
      </ModalHeader>
      <div className='AdminContent'>
        {
          error ? <div>
            <div className='LoadingElement Error'>
              <div className='Throbber'>
                <CancelIcon/>
              </div>
              <div>{error}</div>
            </div>
            <div className="GoBack">
              <span onClick={
                () => {
                  setUpdating(false);
                  setUpdated(false);
                  setError('');
                }
              }>Go back to form</span>
            </div>
          </div> : updated ? <div>
            <div className='LoadingElement Updated'>
              <div className='Throbber'>
                <CheckCircleOutlineIcon/>
              </div>
              <div>Updated</div>
            </div>
            <div className="GoBack">
              <span onClick={
                () => {
                  location.reload()
                }
              }>Reload data</span>
            </div>
          </div> : updating ? <div className='LoadingElement Updating'>
            <div className='Throbber'>
              <CircularProgress size="3rem"/>
            </div>
            <div>Updating...</div>
          </div> : <>
            <div className='BasicForm'>
              <div className="BasicFormSection">
                <div>
                  <label className="form-label">CSV File</label>
                </div>
                <div>
                  <FormControl className='BasicForm'>
                    <input
                      id="BatchUserFormFile" type="file"
                      accept='text/csv'
                      onChange={(evt) => {
                        setPayload({
                          file: $('#BatchUserFormFile')[0].files[0]
                        })
                      }}/>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className='Save-Button'>
              <SaveButton
                variant="primary"
                text={'Update'}
                disabled={!payload.file}
                onClick={() => submit()}
              />
            </div>
          </>
        }
      </div>
    </Modal>
  }
)