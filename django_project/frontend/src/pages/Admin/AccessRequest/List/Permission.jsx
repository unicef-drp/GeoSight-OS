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

import React, { Fragment, useRef, useState } from 'react';
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { AdminListContent } from "../../AdminList";
import { formatDateTime, isValidEmail } from "../../../../utils/main";
import axios from "axios";
import { ConfirmDialog } from "../../../../components/ConfirmDialog";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Input } from "@mui/material";
import { ThemeButton } from "../../../../components/Elements/Button";

/**
 * Access Request Permission
 */
export default function AccessRequestPermissionList({ ...props }) {
  const dialogRef = useRef(null);

  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  if (user.is_admin) {
    return <AdminListContent
      columns={[
        { field: 'id', headerName: 'id', hide: true },
        {
          field: 'name', headerName: 'Name', flex: 1,
          renderCell: (params) => {
            return <a
              className='MuiButtonLike CellLink'
              href={urls.api.permission.detail.replace('/0', `/${params.id}`)}>
              {params.value}
            </a>
          }
        },
        { field: 'requester_email', headerName: 'Requester Email', flex: 1 },
        { field: 'status', headerName: 'Status', flex: 1 },
        {
          field: 'submitted_date', headerName: 'Submitted Date', flex: 1,
          renderCell: (params) => {
            return formatDateTime(new Date(params.value))
          }
        },
      ]}
      listUrl={urls.api.permission.list}
      filterDefault={
        [{
          columnField: 'status',
          operatorValue: 'equals',
          value: 'PENDING'
        }]
      }
      {...props}
    />
  } else {
    /** Post new Request **/
    const post = () => {
      const data = {
        user_email: email,
        description: description,
      }
      setSubmitted(true)
      axios.post(window.location.href, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfmiddlewaretoken
        }
      }).then(response => {
        notify('Request has been submitted', NotificationStatus.SUCCESS)
        window.location.reload();
      }).catch(error => {
        setSubmitted(false)
        if (error?.response?.data) {
          notify(error.response.data, NotificationStatus.ERROR)
        } else {
          notify(error.message, NotificationStatus.ERROR)
        }
      })
    }

    return <Fragment>
      <Notification ref={notificationRef}/>
      <AdminListContent
        columns={[
          { field: 'id', headerName: 'id', hide: true },
          {
            field: 'submitted_date', headerName: 'Submitted Date', flex: 1,
            renderCell: (params) => {
              return <a className='MuiButtonLike CellLink'
                        href={urls.api.permission.detail.replace('/0', `/${params.id}`)}>
                {formatDateTime(new Date(params.value))}
              </a>
            }
          },
          { field: 'status', headerName: 'Status', flex: 1 }
        ]}
        listUrl={urls.api.permission.list}
        rightHeader={
          <Fragment>
            {/* APPROVE */}
            <ConfirmDialog
              header='Create new request'
              onConfirmed={() => {
                post(true)
              }}
              ref={dialogRef}
              disabledConfirm={!(description && email && !emailError)}
            >
              <div>
                Brief description of your request
              </div>
              <br/>
              <textarea
                value={description}
                style={{ border: "1px solid #AAA" }}
                rows={10}
                onChange={(event) => {
                  setDescription(event.target.value)
                }}/>
              <br/>
              <br/>
              <div>
                Confirm your email address
              </div>
              <br/>
              <FormControl>
                <InputLabel>Confirm email</InputLabel>
                <Input
                  type="email"
                  style={{ width: "100%" }}
                  onChange={(event) => {
                    if (!isValidEmail(event.target.value)) {
                      setEmailError('Email is invalid');
                    } else {
                      setEmailError(null);
                    }
                    setEmail(event.target.value)
                  }}
                  value={email}
                />
              </FormControl>
            </ConfirmDialog>
            <ThemeButton
              disabled={submitted}
              variant="secondary"
              onClick={() => {
                dialogRef?.current?.open()
              }}>
              Create new request
            </ThemeButton>
          </Fragment>
        }
        {...props}
      />
    </Fragment>
  }
}