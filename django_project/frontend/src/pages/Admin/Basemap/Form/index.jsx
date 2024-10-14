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

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from '../../index';
import { AdminForm } from '../../Components/AdminForm'
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import { resourceActions } from "../List";

import './style.scss';


/**
 * Indicator Form App
 */
export default function BasemapForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const selectableInput = batch !== null

  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.Basemaps}
      rightHeader={
        <Fragment>
          {
            initialData.id ?
              resourceActions({
                id: initialData.id,
                row: {
                  ...initialData,
                  permission
                }
              }) : null
          }
          <SaveButton
            variant="primary"
            text="Save"
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
            />
          ),
        }}
      />
    </Admin>
  );
}

render(BasemapForm, store)