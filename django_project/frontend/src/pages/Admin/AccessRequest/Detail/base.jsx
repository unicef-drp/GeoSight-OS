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
 * __date__ = '25/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Grid from "@mui/material/Grid";
import { Input } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { formatDateTime } from "../../../../utils/main";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import Admin from "../../index";
import { ThemeButton } from "../../../../components/Elements/Button";
import { useTranslation } from 'react-i18next';

import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";

import './style.scss';

/** Access request Detail */
export default function AccessRequestDetail({ pageName }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [remark, setRemark] = useState("");
  const approveRef = useRef(null);
  const rejectRef = useRef(null);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  useEffect(() => {
    axios.get(urls.api.detail).then(response => {
      const detailData = response.data
      setData(detailData)
    })
  }, [])

  const post = (approve) => {
    const data = {
      remarks: remark,
    }
    if (approve) {
      data['is_approve'] = true
    }
    setSubmitted(true)
    axios.post(urls.api.detail, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfmiddlewaretoken
      }
    }).then(response => {
      notify((approve ? t('admin.requestApproved') : t('admin.requestRejected')) + '!', NotificationStatus.SUCCESS)
      window.location = urls.api.list;
    }).catch(error => {
      setSubmitted(false)
      if (error?.response?.data) {
        notify(error.response.data, NotificationStatus.ERROR)
      } else {
        notify(error.message, NotificationStatus.ERROR)
      }
    })
  }

  return <Admin
    pageName={pageName}
    rightHeader={
      data?.status === 'PENDING' && user.is_staff ? <Fragment>

        {/* APPROVE */}
        <ConfirmDialog
          header={t('admin.approveRequestHeader')}
          onConfirmed={() => {
            post(true)
          }}
          ref={approveRef}
        >
          <div>
            {t('admin.approveRequestQuery')}<br/>
            {data.type === 'NEW_USER' ? t('admin.approveRequestNewUser') : t('admin.approveRequestPermission')}
          </div>
          <br/>
          <FormControl>
            <InputLabel>{t('admin.approveRequestRemarks')}</InputLabel>
            <Input
              type="text"
              style={{ width: "100%" }}
              onChange={(event) => {
                setRemark(event.target.value)
              }}
              value={remark}
            />
          </FormControl>
        </ConfirmDialog>
        <ThemeButton
          disabled={submitted}
          variant="primary"
          onClick={() => {
            approveRef?.current?.open()
          }}>
          {t('admin.approveRequestButton')}
        </ThemeButton>

        {/* REJECT */}
        <ConfirmDialog
          header={t('admin.rejectRequestHeader')}
          onConfirmed={() => {
            post(false)
          }}
          ref={rejectRef}
        >
          <div>
            {t('admin.rejectRequestQuery')}<br/>
          </div>
          <br/>
          <FormControl>
            <InputLabel>{t('admin.rejectRequestRemarks')}</InputLabel>
            <Input
              type="text"
              style={{ width: "100%" }}
              onChange={(event) => {
                setRemark(event.target.value)
              }}
              value={remark}
            />
          </FormControl>
        </ConfirmDialog>
        <ThemeButton
          disabled={submitted}
          variant="Error"
          onClick={() => {
            rejectRef?.current?.open()
          }}>
          {t('admin.rejectRequestButton')}
        </ThemeButton>
      </Fragment> : null
    }
  >
    {
      data ?
        <div className='FlexScrollableSection Detail'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className='DetailSection'>
                <div>{t('admin.dataStatusSection')}</div>
                <div>{data.status}</div>
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>{t('admin.dataNameSection')}</div>
                <div>{data.requester_first_name + ' ' + data.requester_last_name}</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>{t('admin.dataEmailSection')}</div>
                <div>{data.requester_email}</div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>{t('admin.dataSubmittedAtSection')}</div>
                <div>
                  {data.submitted_on ? formatDateTime(new Date(data.submitted_on)) : null}
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className='DetailSection'>
                <div>{t('admin.dataDescriptionSection')}</div>
                <div>{data.description}</div>
              </div>
            </Grid>
          </Grid>
          {
            data.status !== 'PENDING' ?
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>{data?.status === 'APPROVED' ? t('admin.dataApprovedBy') : t('admin.dataRejectedBy')}</div>
                    <div>{data.approval_by}</div>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>{data?.status === 'APPROVED' ? t('admin.dataApprovedAt') : t('admin.dataRejectedAt')}</div>
                    <div>
                      {data.approved_date ? formatDateTime(new Date(data.approved_date)) : null}
                    </div>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>{t('admin.dataRemarks')}</div>
                    <div>{data.approver_notes}</div>
                  </div>
                </Grid>
              </Grid> : null
          }
          <Notification ref={notificationRef}/>
        </div> : null
    }
  </Admin>
}