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
 * __date__ = '24/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useRef, useState } from "react";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {
  DeleteButton,
  SaveButton
} from "../../../../../components/Elements/Button";
import { ConfirmDialog } from "../../../../../components/ConfirmDialog";
import {
  Notification,
  NotificationStatus
} from "../../../../../components/Notification";
import { DjangoRequests } from "../../../../../Requests";
import { CopyIcon } from "../../../../../components/Icons";
import { IconTextField } from "../../../../../components/Elements/Input";

function ApiKeyDetail({ apiKey, onDelete, onError }) {
  const [submitted, setSubmitted] = useState(false);
  const confirmDialogRef = useRef(null);

  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }


  return <div>
    {
      apiKey.is_active ? <Fragment>
          <Alert style={{ textAlign: 'left' }} severity='warning'>
            <AlertTitle>
              This API Key is personal and please do not share
              it with other people. If we notice suspect behavior, your API Key
              can
              be
              deleted and your account suspended.
            </AlertTitle>
          </Alert>
          <br/>
          <Alert style={{ textAlign: 'left' }} severity='warning'>
            <AlertTitle>
              If you forgot your API Key, you must delete the
              existing one and regenerate a new API Key. The GeoSight team is not
              able
              to retrieve your API Key. After generating a new API Key, please
              make
              sure you update your applications with the newly generated API Key!
            </AlertTitle>
          </Alert>
        </Fragment> :
        <Alert style={{ textAlign: 'left' }} severity='warning'>
          <AlertTitle>
            Your API Key is inactive.<br/>
            In order to obtain more information or to reactivate your API KEY,
            please contact an administrator.
          </AlertTitle>
        </Alert>
    }
    <br/>
    {
      apiKey.is_active ?
        <DeleteButton
          disabled={submitted}
          variant="Error Reverse"
          text={"Delete Api Key"}
          onClick={() => {
            confirmDialogRef?.current?.open()
          }}
        /> : null
    }
    <ConfirmDialog
      header='Are you sure you want to delete this API Key?'
      onConfirmed={() => {
        setSubmitted(true)
        DjangoRequests.delete(urls.api.user.apiKey).then(
          response => {
            onDelete()
          }
        ).catch((error) => {
          onError(error)
        })
      }}
      ref={confirmDialogRef}
    >
      <div>
        Any applications or scripts using this API Key will no longer be able
        to access the GeoSight API. You cannot undo this action.
      </div>
    </ConfirmDialog>

    <div className='Detail'>
      {
        apiKey.api_key ?
          <IconTextField
            disabled={true}
            iconEnd={
              <CopyIcon
                style={{ cursor: "pointer" }}
                onClick={_ => {
                  navigator.clipboard.writeText(apiKey.api_key);
                  notify("API Key copied to clipboard", NotificationStatus.SUCCESS);
                }}>
              </CopyIcon>
            }
            type={'text'}
            value={apiKey.api_key}
          /> : null
      }
      <div>Created At : {apiKey.created}</div>
      <div>Platform : {apiKey.platform}</div>
      <div>Status : {apiKey.is_active ? 'Active' : 'Inactive'}</div>
    </div>
    <Notification ref={notificationRef}/>
  </div>
}

function ApiKeyUserCreate({ onCreated, onError }) {
  const [platform, setPlatform] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const confirmDialogRef = useRef(null);

  return <div className="BasicFormSection">
    <label className="form-label required">Platform</label>
    <input
      type="text"
      disabled={submitted}
      value={platform}
      onChange={evt => {
        setPlatform(evt.target.value)
      }}/>
    <br/>
    <br/>
    <SaveButton
      variant="primary"
      text="Generate API Key"
      onClick={() => {
        confirmDialogRef?.current?.open()
      }}
      disabled={submitted || !platform}
    />
    <ConfirmDialog
      header='Generating new API Key'
      onConfirmed={() => {
        setSubmitted(true)
        DjangoRequests.post(
          urls.api.user.apiKey, {
            'platform': platform
          }
        ).then(
          response => {
            onCreated({
              'user_id': response.data['user_id'],
              'api_key': response.data['api_key'],
              'created': response.data['created'],
              'platform': platform,
              'is_active': true
            })
          }
        ).catch((error) => {
          onError(error)
        })
      }}
      ref={confirmDialogRef}
    >
      <div>
        This API Key is personal and please do not share it with other people.
        If we notice suspect behavior, your API Key can be deleted and your
        account suspended.
      </div>
    </ConfirmDialog>
  </div>
}

export default function ApiKeyUser() {
  const [init, setInit] = useState(true);
  const [apiKey, setApiKey] = useState(null);

  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }


  /** Fetch data when modal is opened **/
  useEffect(() => {
    DjangoRequests.get(urls.api.user.apiKey).then(
      response => {
        setApiKey(response.data[0])
        setInit(false)
      }
    )
  }, [])

  return <div className='ApiKeyUser'>
    {
      !init ?
        <Fragment>
          {
            !apiKey ?
              <ApiKeyUserCreate
                onCreated={(apiKey) => {
                  setApiKey(apiKey)
                  notify('The API Key has been successfully created!', NotificationStatus.SUCCESS)
                }}
                onError={() => {
                  notify('Error when creating API Key!', NotificationStatus.ERROR)
                }}
              /> :
              <ApiKeyDetail
                apiKey={apiKey}
                onDelete={() => {
                  setApiKey(null)
                  notify('The API Key has been successfully deleted!', NotificationStatus.SUCCESS)
                }}
                onError={() => {
                  notify('Error when deleting API Key!', NotificationStatus.ERROR)
                }}
              />
          }
        </Fragment> : null
    }
    <Notification ref={notificationRef}/>
  </div>
}