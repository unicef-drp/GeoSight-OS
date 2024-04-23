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
import { FormControl } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import Modal, { ModalHeader } from "../../../../../components/Modal";
import { SaveButton } from "../../../../../components/Elements/Button";

import './style.scss';

/**
 * Batch user form for group
 */
export const BatchUserForm = forwardRef(
  (
    { data }, ref
  ) => {
    const [open, setOpen] = useState(false)
    const [updating, setUpdating] = useState(true)
    const [updated, setUpdated] = useState(true)

    useImperativeHandle(ref, () => ({
      open(data) {
        setOpen(true)
      }
    }));

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
      </ModalHeader>
      <div className='AdminContent'>
        {
          updated ? <div>
            <div className='LoadingElement Updated'>
              <div className='Throbber'>
                <CheckCircleOutlineIcon/>
              </div>
              <div>Updated</div>
            </div>
            <div className="GoBack">
              <span onClick={
                () => {
                  setUpdating(false);
                  setUpdated(false);
                }
              }>Go back to form</span>
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
                    <input type="file" accept='text/csv'/>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className='Save-Button'>
              <SaveButton
                variant="primary"
                text={'Update'}
                onClick={() => setUpdating(true)}
              />
            </div>
          </>
        }
      </div>
    </Modal>
  }
)