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
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import { AdminForm } from '../../Components/AdminForm'
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import { resourceActions } from "../List";
import { DeleteIcon } from "../../../../components/Icons";

import '../style.scss';
import './style.scss';


/**
 * Indicator Form App
 */
export default function ReferenceLayerViewForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const selectableInput = batch !== null
  const [levels, setLevels] = useState(dataLevels)
  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.ReferenceLayerView}
      rightHeader={
        <Fragment>
          {
            initialData.id ?
              resourceActions({
                id: initialData.identifier,
                row: {
                  ...initialData,
                  permission
                }
              }, true) : null
          }
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
              {
                <table>
                  <tr>
                    <th className="level-column">Level</th>
                    <th>Level name</th>
                    <th></th>
                  </tr>
                  {
                    levels.map((level, idx) => {
                      return <tr key={idx + level.level_name}>
                        <td className="level-column">
                          {idx}
                        </td>
                        <td className="isValue">
                          <TextField
                            defaultValue={level.level_name}
                            name={`level_name_${idx}`}
                            placeholder="Boundary name."
                          />
                        </td>
                        <td className="error">
                          <DeleteIcon onClick={
                            () => {
                              levels.splice(idx, 1)
                              setLevels([...levels])
                            }}/>
                        </td>
                      </tr>
                    })
                  }
                  <tr>
                    <td colSpan={6}>
                      <div
                        className="AddNewLevel"
                        onClick={() => {
                          setLevels(
                            [
                              ...levels,
                              { level_name: `Level ${levels.length}` }
                            ]
                          )
                        }}>
                        <AddIcon/> Add new level
                      </div>
                    </td>
                  </tr>
                </table>
              }
            </DjangoTemplateForm>
          ),
        }}
      />
    </Admin>
  );
}

render(ReferenceLayerViewForm, store)