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
import $ from "jquery";

import { render } from '../../../../../app';
import { store } from '../../../../../store/admin';
import { SaveButton } from "../../../../../components/Elements/Button";
import Admin, { pageNames } from '../../../index';
import AdminForm from '../../../Components/Form'

import './style.scss';


/**
 * Indicator Form App
 */
export default function UserForm() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState(null);

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }

  // If role is super admin, show the is_staff
  useEffect(() => {
    $('input[name="role"]').change(function () {
      roleOnChange($(this).val())
    })
    $('input[name="role"]').trigger('change')
  }, [])

  const roleOnChange = (value) => {
    setRole(value)
    if (value === 'Super Admin') {
      $('input[name="is_staff"]').closest('.BasicFormSection').show()
    } else {
      $('input[name="is_staff"]').closest('.BasicFormSection').hide()
    }
  }
  return (
    <Admin
      pageName={pageNames.UsersAndGroups}
      rightHeader={
        <SaveButton
          variant="secondary"
          text="Save"
          onClick={submit}
          disabled={submitted || !role}
        />
      }>

      <AdminForm isSubmitted={submitted} onChanges={{
        'role': roleOnChange
      }}/>
    </Admin>
  );
}

render(UserForm, store)