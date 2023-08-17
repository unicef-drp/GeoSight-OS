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
 * __date__ = '08/08/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import doc_links, { root } from "../../app/doc_links";
import {
  ArrowForwardIcon,
  ChatBubbleIcon,
  CloseIcon,
  EmailIcon
} from "../Icons";
import { ThemeButton } from "../Elements/Button";

import './style.scss';


/**
 * Help page section
 */

export const HelpPage = forwardRef(
  ({}, ref
  ) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open() {
        return setOpen(_ => !_)
      }
    }));

    return <div
      className={'HelpPageSection ' + (open ? 'Open' : '')}
      onClick={_ => {
        setOpen(false)
      }}>
      <div className='HelpPageSection-Content' onClick={_ => {
        _.stopPropagation();
      }}>
        <div className='HelpPageSection-Close'>
          <CloseIcon
            onClick={_ => {
              setOpen(false)
            }}/>
        </div>
        <div className='HelpPageSection-InnerContent'>
          <div className='title'>GeoSight Help Center</div>
          <a
            tabIndex="-1"
            href={doc_links.quickstart}
            target={'_blank'}
            className='section'>
            <div className='title'>Get started with GeoSight.</div>
            <div className='content'>
              A quickstart to understanding geosight platform.
            </div>
          </a>
          <a
            tabIndex="-1"
            href={root}
            target={'_blank'}
            className='link'>
            Visit our Documentation <ArrowForwardIcon/>
          </a>
        </div>
        <div className='HelpPageSection-Footer'>
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