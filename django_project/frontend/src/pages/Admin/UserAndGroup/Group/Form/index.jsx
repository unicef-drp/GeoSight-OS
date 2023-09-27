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

import React, { Fragment, useEffect, useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";

import { render } from '../../../../../app';
import { store } from '../../../../../store/admin';
import {
  AddButton,
  SaveButton
} from "../../../../../components/Elements/Button";
import Admin, { pageNames } from '../../../index';
import AdminForm from '../../../Components/Form'
import { fetchJSON } from "../../../../../Requests";
import UserSelector, { USER_COLUMNS } from "../../../ModalSelector/User";
import { MainDataGrid } from "../../../../../components/MainDataGrid";
import { resourceActions } from "../List";

import './style.scss';


/**
 * Indicator Form App
 */
export default function GroupForm() {
  const [submitted, setSubmitted] = useState(false);
  const [usersGroup, setUsersGroup] = useState(null);
  const [open, setOpen] = useState(false)

  /** Render **/
  const submit = () => {
    setSubmitted(true)
  }


  /** Fetch data when modal is opened **/
  useEffect(() => {
    if (urls.api.detail) {
      fetchJSON(urls.api.detail)
        .then(data => {
          setUsersGroup(data.users)
        })
    } else {
      setUsersGroup([])
    }
  }, [])

  return (
    <Admin
      pageName={pageNames.UsersAndGroups}
      rightHeader={
        <Fragment>
          {
            initialData.id ?
              resourceActions({
                id: initialData.id,
                row: {
                  ...initialData,
                  permission: {
                    delete: (user.is_staff)
                  }
                }
              }) : null
          }
          <SaveButton
            variant="primary"
            text="Save"
            onClick={submit}
            disabled={submitted ? true : false}
          />
        </Fragment>
      }>

      <AdminForm isSubmitted={submitted}>
        <div className='MembersLabel'>
          <label className="form-label required" htmlFor="name">Members</label>
          <AddButton
            variant="primary"
            text={"Add users"}
            onClick={() => {
              setOpen(true)
            }}
          />
        </div>
        {
          usersGroup ?
            <div className='UserTable'>
              <input type={"text"} name='users' className='UserInput'
                     value={usersGroup.map(user => user.id).join(',')}/>
              <MainDataGrid
                rows={usersGroup}
                columns={USER_COLUMNS}
                pageSize={20}
                rowsPerPageOptions={[20]}
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'username', sort: 'asc' }],
                  },
                }}
                disableSelectionOnClick
              />
              <UserSelector
                open={open}
                setOpen={setOpen}
                selectedData={usersGroup}
                selectedDataChanged={setUsersGroup}
              />
            </div> :
            <div style={{ textAlign: "center" }}>
              <CircularProgress/>
            </div>
        }
      </AdminForm>
    </Admin>
  );
}

render(GroupForm, store)