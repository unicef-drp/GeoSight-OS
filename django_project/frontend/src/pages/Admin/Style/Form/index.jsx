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

import React, { useRef, useState } from 'react';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import { AdminForm } from '../../Components/AdminForm'
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import { AdminFormInput } from "../../Components/AdminForm/Base";
import { dictDeepCopy } from "../../../../utils/main";
import { SaveButton } from "../../../../components/Elements/Button";
import StyleConfig from "./StyleConfig";
import { Select } from "../../../../components/Input";

import './style.scss';


/**
 * Indicator Form App
 */
export default function StyleForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [styleData, setStyleData] = useState(style);
  const selectableInput = batch !== null

  /** Render **/
  const typeChoices = types.map(type => {
    return {
      value: type[0],
      label: type[1]
    }
  })
  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.Styles}
      rightHeader={
        <SaveButton
          variant="primary"
          text="Save"
          onClick={() => {
            formRef.current.submit(true)
            setSubmitted(true)
          }}
          disabled={submitted ? true : false}
        />
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
              <AdminFormInput
                selectableInput={selectableInput}
                label='Value type'
                attrName='value_type'
                required={true}>
                <Select
                  options={typeChoices}
                  value={typeChoices.find(type => type.value === styleData.value_type)}
                  name='value_type'
                  onChange={evt => {
                    styleData.value_type = evt.value
                    setStyleData({ ...styleData })
                  }}
                  menuPlacement='top'
                />
              </AdminFormInput>
            </DjangoTemplateForm>
          ),
          'Style Config': (
            <StyleConfig
              data={dictDeepCopy(styleData)}
              setData={style => {
                if (JSON.stringify(style) !== JSON.stringify(styleData)) {
                  setStyleData({ ...style })
                }
              }}
              defaultStyleRules={styleData.style ? styleData.style : currentRules ? currentRules : []}
            />
          )
        }}
      />
    </Admin>
  );
}

render(StyleForm, store)