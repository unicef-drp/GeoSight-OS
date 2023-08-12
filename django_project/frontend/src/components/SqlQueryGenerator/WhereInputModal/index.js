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

import React, { useEffect, useState } from 'react';
import { WhereQueryGenerator } from "../../SqlQueryGenerator"
import Modal, { ModalContent, ModalHeader } from "../../../components/Modal";
import { SaveButton } from "../../Elements/Button";

import './style.scss';

/**
 * Filter input
 * @param {dict} value Value of data.
 * @param {Function} setValue Set value Functions.
 * @param {Array} fields Fields of data.
 * @param {dict} disabledChanges Disabled some inputs.
 * @param {dict} props Additional props.
 */
export default function WhereInputModal(
  { value, setValue, fields, disabledChanges = {}, ...props }
) {
  const [where, setWhere] = useState(value);
  const [open, setOpen] = useState(false);
  const onClosed = () => {
    setOpen(false);
  };

  /*** Change where when opened and value changed ***/
  useEffect(() => {
      setWhere(value)
    }, [value, open]
  )

  /** Update fields to required fields **/
  const updateFields = (fields) => {
    if (!fields) {
      return fields
    }
    return fields.map(field => {
      return {
        name: field.name,
        type: field.type ? field.type : 'text',
        value: field.name,
        options: field?.options
      }
    })
  }
  return <div className="BasicFormSection">
    <label
      className={"form-label"}>
      {props.title ? props.title : "Change filter for the data."}
    </label>
    <input
      type="text"
      placeholder={"SQL Filter"}
      readOnly={true}
      value={where}
      onClick={evt => setOpen(true)}
      onChange={(evt) => {
      }}
    />
    <span className="form-helptext">
      {props.description ? props.description : ""}
    </span>
    <Modal
      className={'WhereConfigurationModal'}
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        Define {props.title ? props.title : "Change filter for the data."}
      </ModalHeader>
      <ModalContent>
        <WhereQueryGenerator
          fields={updateFields(fields)}
          whereQuery={where}
          setWhereQuery={(where) => {
            setWhere(where)
          }}
          disabledChanges={disabledChanges}
          {...props}
        />
        {
          fields ?
            <div className='Save-Button'>
              <SaveButton
                variant="primary"
                text={"Apply"}
                onClick={() => {
                  setValue(where)
                  setOpen(false)
                }}/>
            </div> : ""
        }
      </ModalContent>
    </Modal>
  </div>
}