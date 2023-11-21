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

import React, { Fragment } from 'react';
import { ChatBubbleIcon, EmailIcon } from "./Icons";
import { ThemeButton } from "./Elements/Button";
import { DocsCrawlerPage } from "django-docs-crawler-react";

import "django-docs-crawler-react/dist/style.css";

/** Docs Crawler section */
export const DocsCrawlerGeosight = ({ open, setOpen }) => {
  return <DocsCrawlerPage
    dataUrl={'/docs_crawler/data'}
    open={open}
    setOpen={setOpen}
    footer={
      <Fragment>
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
      </Fragment>
    }
  />
}