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

import React, { forwardRef, useImperativeHandle, useState } from "react";
import DocsCrawler from "./lib/Page";
import { ChatBubbleIcon, EmailIcon } from "../Icons";
import { ThemeButton } from "../Elements/Button";

/** Help center section */

export const HelpCenter = forwardRef(({}, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      return setOpen((_) => !_);
    },
  }));

  return (
    <DocsCrawler
      dataUrl="/docs/data"
      open={open}
      setOpen={setOpen}
      footer={
        <>
          {/* @ts-ignore */}
          {preferences.send_feedback_url && (
            /* @ts-ignore */
            <a href={preferences.send_feedback_url} target="_blank">
              <ThemeButton
                variant="basic Basic"
                /* @ts-ignore */
                disabled={!preferences.send_feedback_url}
              >
                <EmailIcon /> Send Feedback
              </ThemeButton>
            </a>
          )}
          {/* @ts-ignore */}
          {preferences.contact_us_url && (
            /* @ts-ignore */
            <a href={preferences.contact_us_url} target="_blank">
              <ThemeButton
                variant="basic Basic"
                /* @ts-ignore */
                disabled={!preferences.contact_us_url}
              >
                <ChatBubbleIcon /> Contact Us
              </ThemeButton>
            </a>
          )}
        </>
      }
    />
  );
});
