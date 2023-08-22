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

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from "@mui/material";

import Block from "./Block";
import { ChatBubbleIcon, CloseIcon, EmailIcon } from "../Icons";
import data from './data.json';

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

export const HelpCenter = forwardRef(
  ({}, ref
  ) => {
    const [open, setOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      open() {
        return setOpen(_ => !_)
      }
    }));

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
          <Block data={data} isRoot={true}/>
        </div>
        {/* -------------------------------- */}
        <div className='HelpCenter-Footer'>
          <a
            tabIndex="-1"
            href='#'>
            <ThemeButton
              tabIndex="-1"
              variant="basic Basic"
              disabled={true}
            >
              <EmailIcon/> Send Feedback
            </ThemeButton>
          </a>
          <a
            tabIndex="-1"
            href='#'>
            <ThemeButton
              tabIndex="-1"
              variant="basic Basic"
              disabled={true}
            >
              <ChatBubbleIcon/> Contact Us
            </ThemeButton>
          </a>
        </div>
      </div>
    </div>
  }
)