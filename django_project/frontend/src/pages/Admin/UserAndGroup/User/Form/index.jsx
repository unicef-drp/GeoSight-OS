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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import $ from "jquery";
import { Checkbox, FormControlLabel, IconButton } from "@mui/material";

import { render } from '../../../../../app';
import { store } from '../../../../../store/admin';
import {
  SaveButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import Admin, { pageNames } from '../../../index';
import AdminForm from '../../../Components/Form'

import {
  VisibilityIcon,
  VisibilityOffIcon
} from "../../../../../components/Icons";
import { IconTextField } from "../../../../../components/Elements/Input";
import { urlParams } from "../../../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../../../components/Notification";
import { resourceActions } from "../List";

import './style.scss';

/**
 * Indicator Form App
 */
export default function UserForm() {
  const { success } = urlParams()
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState(null);
  const [apiKey, setApiKey] = useState(user.georepo_api_key ? user.georepo_api_key : '');
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [receiveNotification, setReceiveNotification] = useState(false);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }

  // If role is super admin, show the is_staff
  useEffect(() => {
    if (!user.is_staff) {
      $('input[name="is_staff"]').closest('.BasicFormSection').remove()
      $('input[name="receive_notification"]').closest('.BasicFormSection').remove()
    } else {
      if ($('p[data-field-name="is_staff"]').length) {
        setIsStaff($('#id_is_staff').is(':checked'))
        $('p[data-field-name="is_staff"]').remove()
      }
      if ($('p[data-field-name="receive_notification"]').length) {
        setReceiveNotification($('#id_receive_notification').is(':checked'))
        $('p[data-field-name="receive_notification"]').remove()
      }
    }
    $('input[name="is_staff"]').closest('.BasicFormSection').hide()
    $('input[name="role"]').change(function () {
      roleOnChange($(this).val())
    })
    $('input[name="role"]').trigger('change')
    if (success) {
      notify('Profile is updated', NotificationStatus.SUCCESS)
    }
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
        <Fragment>
          {
            ownForm && preferences.georepo_using_user_api_key && !apiKey ?
              <ThemeButton variant="Error" className='GeorepoApiKeyBtn'>
                <a
                  href={new URL(preferences.georepo_url).origin + '/profile?tab=2'}>
                  Generate GeoRepo API Key
                </a>
              </ThemeButton>
              : null
          }
          {
            initialData.id ?
              resourceActions({
                id: initialData.id,
                row: {
                  ...initialData,
                  permission: {
                    delete: (ownForm || user.is_staff)
                  }
                }
              }) : null
          }
          <SaveButton
            variant="primary"
            text="Save"
            onClick={submit}
            disabled={submitted || (!ownForm && !role)}
          />
        </Fragment>
      }>

      <AdminForm isSubmitted={submitted} onChanges={{
        'role': roleOnChange
      }}>
        {
          user.is_staff ? <Fragment>
            <div className="BasicFormSection">
              <FormControlLabel
                checked={isStaff}
                control={<Checkbox/>}
                name='is_staff'
                onChange={evt => {
                  setIsStaff(val => !val)
                }}
                label={'Backend admin (Django Staff)'}/>
              <div className="form-helptext">
                Designates whether the user can access the backend (Django)
                admin
                site.
              </div>
            </div>
            <div className="BasicFormSection">
              <FormControlLabel
                checked={receiveNotification}
                control={<Checkbox/>}
                name='receive_notification'
                onChange={evt => {
                  setReceiveNotification(val => !val)
                }}
                label={'Receive email for admin notification.'}/>
              <div className="form-helptext">
                Designates whether the user receive notification.
              </div>
            </div>
          </Fragment> : null
        }
        {
          ownForm ?
            <div className='ApiKeySection'>
              {
                preferences.georepo_using_user_api_key ?
                  <div className='BasicFormSection'>
                    <div>GeoRepo API Key</div>
                    <div
                      className={'InputInLine ' + (apiKey ? '' : 'GeorepoApiKeyInput')}
                    >
                      <IconTextField
                        name={'georepo_api_key'}
                        iconEnd={
                          <IconButton onClick={_ => setShowAPIKey(_ => !_)}>
                            {
                              showAPIKey ? <VisibilityOffIcon/> :
                                <VisibilityIcon/>
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
                      A GeoRepo API KEY is required for authorizing GeoSight to
                      access GeoRepo data.
                      <br/>
                      To generate a GeoRepo API KEY, go to
                      {
                        !apiKey ?
                          <ThemeButton
                            variant="Error"
                            style={{ marginLeft: "3px" }}>
                            <a
                              href={new URL(preferences.georepo_url).origin + '/profile?tab=2'}
                              style={{
                                color: "white",
                              }}
                              target='_blank'>
                              GeoRepo website.
                            </a>
                          </ThemeButton> : <a
                            href={new URL(preferences.georepo_url).origin + '/profile'}
                            target='_blank'> GeoRepo website</a>
                      }
                      <br/>
                      If you need more information on how to generate a GeoRepo
                      API KEY, you can check <a
                      href='https://unicef-drp.github.io/GeoRepo-OS/user/api/guide/#generating-an-api-key'
                      target='_blank'>
                      this page
                    </a>.
                    </div>
                  </div> : null
              }
            </div> : null
        }
      </AdminForm>
      <Notification ref={notificationRef}/>
    </Admin>
  );
}

render(UserForm, store)