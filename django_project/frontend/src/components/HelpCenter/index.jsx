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
 * __date__ = '22/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { ChatBubbleIcon, CloseIcon, EmailIcon } from "../Icons";
import Block from "./Block";

import './style.scss';

/** Themed button
 * @param {string} buttonProps Variant of Button.
 * @param {React.Component} children React component to be rendered
 */
export function ThemeButton({ children, ...props }) {
  return (
    <Button {...props}
            className={'ThemeButton ' + (props.className ? props.className : '')}>
      {children}
    </Button>
  )
}

/** Help center section */

export const HelpCenter = forwardRef(({}, ref) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)

    useImperativeHandle(ref, () => ({
      open() {
        return setOpen(_ => !_)
      }
    }));

    useEffect(
      () => {
        setLoading(true)
        fetch(`/docs/data?relative_url=` + window.location.pathname,)
          .then(response => response.json())
          .then((response) => {
            if (response.detail) {
              throw new Error(response.detail)
            }
            response.html = response.intro
            setLoading(false)
            setData(response)
          })
          .catch(err => {
            setLoading(false)
          })
      }, [])

    return <div
      className={'HelpCenter ' + (open ? 'Open' : '')}
      onClick={_ => {
        setOpen(false)
      }}>
      <div className='HelpCenter-Content' onClick={_ => {
        _.stopPropagation();
      }}>
        <div className='HelpCenter-Close'>
          <CloseIcon
            onClick={_ => {
              setOpen(false)
            }}/>
        </div>

        {/* -------------------------------- */}
        {/* CONTENT */}
        <div className='HelpCenter-InnerContent'>
          {
            loading ? <div className='Throbber'>
              <CircularProgress/> Loading...
            </div> : data ? <Block data={data} isRoot={true}/> :
              <div className='NotFound'>No helps found</div>
          }
        </div>
        {/* -------------------------------- */}
        <div className='HelpCenter-Footer'>
          <a
            tabIndex="-1"
            href={preferences.send_feedback_url}
            target="_blank"
          >
            <ThemeButton
              tabIndex="-1"
              variant="basic Basic"
              disabled={!preferences.send_feedback_url}
            >
              <EmailIcon/> Send Feedback
            </ThemeButton>
          </a>
          <a
            tabIndex="-1"
            href={preferences.contact_us_url}
            target="_blank"
          >
            <ThemeButton
              tabIndex="-1"
              variant="basic Basic"
              disabled={!preferences.contact_us_url}
            >
              <ChatBubbleIcon/> Contact Us
            </ThemeButton>
          </a>
        </div>
      </div>
    </div>
  }
)