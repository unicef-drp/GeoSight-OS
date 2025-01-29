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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import $ from 'jquery';
import PermissionFormAdmin from "./PermissionFormAdmin"

import './style.scss';
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { urlParams } from "../../../../utils/main";

const GeneralTab = 'General'
const ShareTab = 'Share'

/**
 * Basic Admin FOrm
 * @param {Object} onChanges Events onchange for every input.
 * @param {dict} forms Forms element by dictionary for tab.
 * @param {React.Component} children React component to be rendered.
 * @param {dict} props Other properties.
 */
export const AdminForm = forwardRef(
  (
    {
      onChanges = {},
      onTabChanges = null,
      forms = {},
      children,
      ...props
    }, ref
  ) => {

    // Notification
    const notificationRef = useRef(null);
    const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
      notificationRef?.current?.notify(newMessage, newSeverity)
    }

    /** When success **/
    useEffect(() => {
      const params = urlParams()
      if (params.success) {
        notify('Saved!', NotificationStatus.SUCCESS)
      }
    }, []);


    // Submit
    useImperativeHandle(ref, () => ({
      submit(saveAs = false) {
        return submit(saveAs)
      }
    }));

    let defaultTab = window.location.hash.replace('#', '').replaceAll('%20', ' ')
    if (!Object.keys(forms).includes(defaultTab)) {
      defaultTab = Object.keys(forms)[0]
    }
    const [tab, setTab] = useState(defaultTab);

    /** When tab changes **/
    useEffect(() => {
      if (onTabChanges) {
        onTabChanges(tab)
      }

      window.location.hash = tab
    }, [tab]);

    /** Render **/
    const submit = (saveAs = false) => {
      const url = window.location.href.split('?')[0].split('#')[0]
      if (saveAs) {
        $('#Form').attr('action', url + '?save-as=true')
      } else {
        $('#Form').attr('action', url)
      }
      $('.BasicForm').submit()
    }

    /*** Create tab of forms ***/
    function Tab({ tabName, disabled = false }) {
      return <div
        key={tabName}
        onClick={_ => {
          if (!disabled) {
            setTab(tabName)
          }
        }}
        className={
          (tab === tabName ? 'Selected ' : '') +
          (disabled ? 'Disabled' : '')
        }
      >
        {tabName}
      </div>
    }

    /** Render **/
    const permissionApi = urls?.api?.permission
    const disabledTabs = props.disabledTabs ? props.disabledTabs : []
    return (
      <div className={'AdminForm ' + (props.isWizard ? 'Wizard' : '')}>
        {/* --------------------  TAB -------------------- */}
        <div className={'TabPrimary ' + tab}>
          {
            Object.keys(forms).map(key =>
              <Tab key={key} tabName={key}
                   disabled={disabledTabs.includes(key)}
              />
            )
          }
          {permissionApi ? <Tab tabName={ShareTab}/> : null}
        </div>
        {/* --------------------  CONTENT -------------------- */}
        <form
          id='Form' className={'BasicForm ' + tab}
          method="post"
          action={props.action ? props.action : window.location.href}
          encType="multipart/form-data"
          onSubmit={e => e.preventDefault()}
        >
          {
            Object.keys(forms).map(key => {
              return <div
                key={key}
                className={key + " " + (tab !== key ? 'Hidden' : "")}>
                {forms[key]}
              </div>
            })
          }
          {
            permissionApi ?
              <div className={tab !== ShareTab ? 'Hidden' : null}>
                <PermissionFormAdmin permissionApi={permissionApi}/>
              </div> : null
          }
        </form>
        <Notification ref={notificationRef}/>
      </div>
    );
  }
)