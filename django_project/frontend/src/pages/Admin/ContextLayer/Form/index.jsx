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
import $ from 'jquery';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import { AdminForm } from '../../Components/AdminForm'
import StyleConfig from '../StyleConfig'
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";

import './style.scss';

/**
 * Context Layer Form App
 */
export default function ContextLayerForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({});
  const selectableInput = batch !== null
  const [tab, setTab] = useState(null);

  /** Set Data Function **/
  const setDataFn = () => {
    const formData = data
    $('.BasicForm').find('input').each(function () {
      const name = $(this).attr('name');
      if (name) {
        formData[name] = $(this).val()
      }
    })
    if (formData['data_fields']) {
      formData['data_fields'] = JSON.parse(formData['data_fields'])
    }
    if (formData['styles']) {
      formData['styles'] = JSON.parse(formData['styles'])
    }
    if (formData['label_styles']) {
      formData['label_styles'] = JSON.parse(formData['label_styles'])
    }
    formData['parameters'] = formData['parameters'] ? formData['parameters'] : {}
    setData(JSON.parse(JSON.stringify(formData)))
  }

  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData)
      $('*[name="label_styles"]').val(JSON.stringify(newData['label_styles']))
      $('*[name="data_fields"]').val(JSON.stringify(newData['data_fields']))
      $('*[name="styles"]').val(JSON.stringify(newData['styles']))
    }
  }
  return (
    <Admin
      pageName={pageNames.ContextLayer}
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
        onTabChanges={setTab}
        forms={{
          'General': (
            <DjangoTemplateForm
              selectableInput={selectableInput}
              selectableInputExcluded={['name', 'shortcode']}
              onChange={(name, value) => {
                setDataFn()
              }}
            />
          ),
          'Map': (
            <StyleConfig data={data} setData={updateData} defaultTab={tab}/>
          ),
          'Fields': <div/>,
          'Label': <div/>,
          'Style': <div/>,
        }}
      />
    </Admin>
  );
}

render(ContextLayerForm, store)