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
 * __date__ = '07/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from 'react';
import { fetchingData } from "../../../Requests";
import NunjucksConfig from "./index";

import './style.scss';

let session = null
/**
 * Nunjucks Config
 */
export default function NunjucksConfigWithRequest(
  {
    template,
    setTemplate,
    url,
    params = {},
    onResultChanges,
    preformatContext,
    children,
    ...props
  }
) {
  const [context, setContext] = useState(null)
  const [contextError, setContextError] = useState(null)

  /**
   * Update context
   */
  useEffect(() => {
    if (url) {
      const currentSession = (new Date()).getTime()
      setContext('loading')
      setContextError(null)

      fetchingData(
        url, params, {}, function (newContext, error) {
          if (session !== currentSession) {
            if (error) {
              setContextError(error)
            } else {
              if (preformatContext) {
                setContext(preformatContext(newContext))
              } else {
                setContext({
                  context: newContext
                })
              }
            }
            session = currentSession
          }
        }
      )
    }
  }, [url, params])

  return <NunjucksConfig
    template={template}
    setTemplate={template => {
      setTemplate(template)
    }}
    defaultTemplateInput={''}
    context={context ? context : {}}
    hideContext={true}
    onResultChanges={onResultChanges}
    {...props}
  >
    <div>
      {children}
      {
        contextError ? <div className='error'>{contextError}</div> : <pre>
          {context ? JSON.stringify(context, null, 2) : "Loading"}
        </pre>
      }
    </div>
  </NunjucksConfig>
}