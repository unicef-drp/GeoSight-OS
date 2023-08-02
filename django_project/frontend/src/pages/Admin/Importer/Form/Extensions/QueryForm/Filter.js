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
import {
  WhereQueryGenerator
} from "../../../../../../components/SqlQueryGenerator"
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import { SaveButton } from "../../../../../../components/Elements/Button";

import './style.scss';
import "../../../../../../components/SqlQueryGenerator/WhereInputModal/style.scss"

/**
 * Filter input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} fields Fields of data.
 * @param {Array} onLoading If it is still loading.
 */
export default function Filter(
  { data, setData, fields, onLoading }
) {
  const [where, setWhere] = useState('');
  const [open, setOpen] = useState(false);
  const onClosed = () => {
    setOpen(false);
  };

  useEffect(() => {
      setWhere(data ? data : '')
    }, [data]
  )

  /** Update fields to required fields **/
  const updateFields = (fields) => {
    if (!fields) {
      return fields
    }
    return fields.map(field => {
      let fieldType = 'text'
      let inputFieldType = field?.type.toLowerCase()
      switch (inputFieldType) {
        case "esriFieldTypeDate":
          fieldType = 'date'
          break
        case 'esriFieldTypeOID':
        case 'esriFieldTypeInteger':
        case 'esriFieldTypeDouble':
          fieldType = 'number'
          break
        default:
          if (inputFieldType) {
            if (['date', 'number'].includes(inputFieldType)) {
              fieldType = inputFieldType
            }
          }
      }
      return {
        name: field.name,
        type: fieldType,
        value: field.value
      }
    })
  }
  return <Fragment>
    <input
      disabled={!fields || onLoading}
      type="text"
      placeholder={onLoading ? "Loading" : "SQL Filter"}
      readOnly={true}
      value={data}
      onClick={evt => setOpen(true)}
      onChange={(evt) => {

      }}
    />
    <Modal
      className={'WhereConfigurationModal'}
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        Change filter for the data.
      </ModalHeader>
      <ModalContent>
        <WhereQueryGenerator
          fields={updateFields(fields)}
          whereQuery={where}
          setWhereQuery={(where) => {
            setWhere(where)
          }}/>
        {
          fields ?
            <div className='Save-Button'>
              <SaveButton
                variant="primary"
                text={"Apply"}
                onClick={() => {
                  setOpen(false)
                  setData(where)
                }}/>
            </div> : ""
        }
      </ModalContent>
    </Modal>
  </Fragment>
}