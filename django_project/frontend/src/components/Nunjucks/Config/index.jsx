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
import { nunjucksContent } from "../index";
import './style.scss';

/**
 * Nunjucks Config
 */
export default function NunjucksConfig(
  {
    template,
    setTemplate,
    context,
    defaultTemplateInput,
    onResultChanges,
    children,
    ...props
  }
) {
  const [contextData, setContextData] = useState(
    JSON.stringify(context, null, 2)
  )

  /**
   * Update context
   */
  useEffect(() => {
    setContextData(JSON.stringify(context, null, 2))
  }, [context])

  /**
   * Update context
   */
  useEffect(() => {
    if (onResultChanges) {
      try {
        onResultChanges(
          nunjucksContent(template, JSON.parse(contextData),
            defaultTemplateInput)
        )
      } catch (err) {
        onResultChanges(err.toString())
      }
    }
  }, [context, template])

  let content;
  let error;
  try {
    content = nunjucksContent(template, JSON.parse(contextData), defaultTemplateInput)
  } catch (err) {
    error = err.toString()
  }

  return <div className='NunjucksConfig'>
    {
      children
    }
    {
      props.hideContext ? null :
        <div className='context'>
          <div className='title'>
            Example context or you can paste json here.
          </div>
          <div className='content textarea'>
            <textarea
              value={contextData}
              onChange={(value) => {
                setContextData(value.target.value)
              }}/>
          </div>
        </div>
    }
    <div className='textarea'>
      <div className='title'>The input expression. Check
        <a href='https://mozilla.github.io/nunjucks/templating.html'>
          <b> here </b>
        </a>
        for the help.
        <div dangerouslySetInnerHTML={{ __html: props.additionalHelp }}>
        </div>
      </div>
      <div className='content textarea'>
        <textarea
          value={template ? template : ''}
          onChange={(value) => {
            setTemplate(value.target.value)
          }}/>
      </div>
    </div>
    <div className="preview">
      <div className='title'>Preview</div>
      <div className='content'>
        {
          !error ? <div dangerouslySetInnerHTML={{ __html: content }}></div> :
            <div className='error'>{error}</div>
        }
      </div>
    </div>
  </div>
}