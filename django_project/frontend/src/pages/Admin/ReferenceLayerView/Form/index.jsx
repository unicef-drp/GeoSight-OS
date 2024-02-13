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

import React, { Fragment, useRef, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import { AdminForm } from '../../Components/AdminForm'
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";

import './style.scss';


export function ReferenceLayerViewLevelRow({ idx }) {
  return <tr>
    <td>{idx}</td>
    <td className="isValue">
      <input
        type="text"
        name={`${idx}_level_name`}
        placeholder="Boundary name."
      />
    </td>
    <td className="isValue">
      <input
        type="text"
        name={`${idx}_field_name`}
        placeholder="Boundary name."
      />
    </td>
    <td className="isValue">
      <input
        type="text"
        name={`${idx}_field_ucode`}
        placeholder="Column name for ucode."
      />
    </td>
    <td className="isValue">
      <input
        type="text"
        disabled={idx === 0}
        name={`${idx}_field_parent_ucode`}
        placeholder="Column name for parent ucode."
      />
    </td>
    <td className="isValue">
      <input
        type="file"
        name={`${idx}_level_file`}
      />
    </td>
  </tr>
}

export function ReferenceLayerViewLevelForm() {
  const [levels, setLevels] = useState([])

  return <table>
    <tr>
      <th>Level</th>
      <th>Level name</th>
      <th>Property name for name boundary</th>
      <th>Property name for unique code (ucode)</th>
      <th>Property name for parent unique code (ucode) - 1 level above it</th>
      <th>Zipped file (contains : shapefile)</th>
    </tr>
    {
      levels.map((level, idx) => {
        return <ReferenceLayerViewLevelRow idx={idx}/>
      })
    }
    <tr>
      <td colSpan={6}>
        <div
          className="AddNewLevel"
          onClick={() => {
            setLevels([...levels, {}])
          }}>
          <AddIcon/> Add new level
        </div>
      </td>
    </tr>
  </table>
}

/**
 * ReferenceLayerViewForm App
 */
export default function ReferenceLayerViewForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const selectableInput = false

  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.ReferenceLayerView}
      rightHeader={
        <Fragment>
          <SaveButton
            variant="primary"
            text="Submit"
            onClick={() => {
              formRef.current.submit(true)
              setSubmitted(true)
            }}
            disabled={submitted ? true : false}
          />
        </Fragment>
      }>
      <AdminForm
        ref={formRef}
        selectableInput={selectableInput}
        forms={{
          'General': (
            <DjangoTemplateForm
              selectableInput={selectableInput}
              selectableInputExcluded={['name', 'shortcode']}
            >
              <ReferenceLayerViewLevelForm/>
            </DjangoTemplateForm>
          ),
        }}
      />
    </Admin>
  );
}

render(ReferenceLayerViewForm, store)