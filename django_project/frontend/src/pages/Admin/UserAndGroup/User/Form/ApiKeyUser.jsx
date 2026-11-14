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
import { useTranslation } from "react-i18next";
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
import { formatDateTime } from "../../../../../utils/main";

function ApiKeyDetail({ apiKey, onDelete, onError }) {
  const { t } = useTranslation();
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
              {t('admin.userAndGroup.apiKey.personalWarning')}
            </AlertTitle>
          </Alert>
          <br/>
          <Alert style={{ textAlign: 'left' }} severity='warning'>
            <AlertTitle>
              {t('admin.userAndGroup.apiKey.forgotKeyWarning')}
            </AlertTitle>
          </Alert>
        </Fragment> :
        <Alert style={{ textAlign: 'left' }} severity='warning'>
          <AlertTitle>
            {t('admin.userAndGroup.apiKey.inactiveWarning')}
          </AlertTitle>
        </Alert>
    }
    <br/>
    {
      apiKey.is_active ?
        <DeleteButton
          disabled={submitted}
          variant="Error Reverse"
          text={t('admin.userAndGroup.apiKey.deleteApiKey')}
          onClick={() => {
            confirmDialogRef?.current?.open()
          }}
        /> : null
    }
    <ConfirmDialog
      header={t('admin.userAndGroup.apiKey.deleteConfirmHeader')}
      onConfirmed={() => {
        setSubmitted(true)
        DjangoRequests.delete(`/api/user/${user.id}/token`).then(
          response => {
            onDelete()
          }
        ).catch((error) => {
          onError(error)
        })
      }}
      ref={confirmDialogRef}
    >
      <div>{t('admin.userAndGroup.apiKey.deleteConfirmBody')}</div>
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
                  notify(t('admin.userAndGroup.apiKey.copiedToClipboard'), NotificationStatus.SUCCESS);
                }}>
              </CopyIcon>
            }
            type={'text'}
            value={apiKey.api_key}
          /> : null
      }
      <div>{t('admin.userAndGroup.apiKey.createdAt')} : {formatDateTime(new Date(apiKey.created))}</div>
      <div>{t('admin.userAndGroup.apiKey.platform')} : {apiKey.platform}</div>
      <div>{t('admin.userAndGroup.apiKey.status')} : {apiKey.is_active ? t('admin.userAndGroup.apiKey.active') : t('admin.userAndGroup.apiKey.inactive')}</div>
      <div>
        {t('admin.userAndGroup.apiKey.expiry')}
        : {!apiKey.expiry ? '-' : formatDateTime(new Date(apiKey.expiry))}
      </div>
    </div>
    <Notification ref={notificationRef}/>
  </div>
}

function ApiKeyUserCreate({ onCreated, onError }) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const confirmDialogRef = useRef(null);

  return <div className="BasicFormSection">
    <label className="form-label required">{t('admin.userAndGroup.apiKey.platform')}</label>
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
      text={t('admin.userAndGroup.apiKey.generateApiKey')}
      onClick={() => {
        confirmDialogRef?.current?.open()
      }}
      disabled={submitted || !platform}
    />
    <ConfirmDialog
      header={t('admin.userAndGroup.apiKey.generateConfirmHeader')}
      onConfirmed={() => {
        setSubmitted(true)
        DjangoRequests.post(
          `/api/user/${user.id}/token`, {
            'platform': platform
          }
        ).then(
          response => {
            onCreated({
              'user_id': response.data['user_id'],
              'api_key': response.data['api_key'],
              'created': response.data['created'],
              'expiry': response.data['expiry'],
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
      <div>{t('admin.userAndGroup.apiKey.generateConfirmBody')}</div>
    </ConfirmDialog>
  </div>
}

export default function ApiKeyUser() {
  const { t } = useTranslation();
  const [init, setInit] = useState(true);
  const [apiKey, setApiKey] = useState(null);

  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }


  /** Fetch data when modal is opened **/
  useEffect(() => {
    DjangoRequests.get(`/api/user/${user.id}/token`).then(
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
                  notify(t('admin.userAndGroup.apiKey.createdSuccess'), NotificationStatus.SUCCESS)
                }}
                onError={() => {
                  notify(t('admin.userAndGroup.apiKey.createError'), NotificationStatus.ERROR)
                }}
              /> :
              <ApiKeyDetail
                apiKey={apiKey}
                onDelete={() => {
                  setApiKey(null)
                  notify(t('admin.userAndGroup.apiKey.deletedSuccess'), NotificationStatus.SUCCESS)
                }}
                onError={() => {
                  notify(t('admin.userAndGroup.apiKey.deleteError'), NotificationStatus.ERROR)
                }}
              />
          }
        </Fragment> : null
    }
    <Notification ref={notificationRef}/>
  </div>
}