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
import { IconButton } from "@mui/material";

import { render } from '../../../../../app';
import { store } from '../../../../../store/admin';
import { SaveButton } from "../../../../../components/Elements/Button";
import Admin, { pageNames } from '../../../index';
import AdminForm from '../../../Components/Form'

import {
  VisibilityIcon,
  VisibilityOffIcon
} from "../../../../../components/Icons";
import { IconTextField } from "../../../../../components/Elements/Input";

import './style.scss';

/**
 * Indicator Form App
 */
export default function UserForm() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState(null);
  const [apiKey, setApiKey] = useState(user.api_key ? user.api_key : '');
  const [showAPIKey, setShowAPIKey] = useState(false);

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }

  // If role is super admin, show the is_staff
  useEffect(() => {
    $('input[name="is_staff"]').closest('.BasicFormSection').hide()
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
          variant="primary"
          text="Save"
          onClick={submit}
          disabled={submitted || (!ownForm && !role)}
        />
      }>

      <AdminForm isSubmitted={submitted} onChanges={{
        'role': roleOnChange
      }}>
        {
          ownForm ?
            <div className='ApiKeySection'>
              {/* API KEY */}
              <div className='BasicFormSection'>
                <div>GeoRepo API Key</div>
                <div className='InputInLine'>
                  <IconTextField
                    name={'georepo_api_key'}
                    iconEnd={
                      <IconButton onClick={_ => setShowAPIKey(_ => !_)}>
                        {
                          showAPIKey ? <VisibilityOffIcon/> : <VisibilityIcon/>
                        }
                      </IconButton>
                    }
                    type={showAPIKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(evt) => {
                      setApiKey(evt.target.value)
                    }}
                  />
                </div>
                <br/>
                <div>
                  GeoRepo api key is used for accessing GeoRepo API and all of
                  geosight pages that needs this access.
                  <br/>
                  To generate GeoRepo API Key, check <a
                  href={new URL(preferences.georepo_url).origin + '/profile'}>the
                  georepo website</a>.
                  <br/>
                  How to Generate GeoRepo API Key, check <a
                  href='https://unicef-drp.github.io/GeoRepo-OS/developer/api/guide/#generating-an-api-key'>this
                  documentation</a>.
                </div>
              </div>
            </div> : null
        }
      </AdminForm>
    </Admin>
  );
}

render(UserForm, store)