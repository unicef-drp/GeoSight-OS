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

import React, { Fragment, useEffect, useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowForwardIcon } from "../Icons";

/** Block help. **/
export default function Block({ data, isRoot }) {
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(isRoot)
  if (data.link[data.link.length - 1] !== '/') {
    data.link += '/'
  }
  const [content, setContent] = useState({
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    html: data.html
  })

  /*** Get contents from docs **/
  const getContents = (content, element) => {
    if (element && !element.id) {
      if (!content.description && element.innerText) {
        content.description = element.innerText
      }
      if (!content.thumbnail && element.getElementsByTagName('img') && element.getElementsByTagName('img')[0]) {
        try {
          const source = element.getElementsByTagName('img')[0].outerHTML.split('src="')[1].split('"')[0]
          content.thumbnail = data.link + source
        } catch (err) {

        }
      }
      return [element.outerHTML].concat(getContents(content, element.nextElementSibling))
    }
    return []
  }

  useEffect(
    () => {
      setLoading(true)
      fetch(data.link)
        .then(response => response.text())
        .then((response) => {
          setLoading(false)

          const parser = new DOMParser()
          const htmlDoc = parser.parseFromString(response, 'text/html')
          const _element = htmlDoc.getElementById(data.anchor.replace('#', ''))
          if (!_element) return
          if (!content.title) {
            content.title = _element.innerText.replaceAll('¶', '')
          }
          const contents = getContents(content, _element.nextElementSibling)
          if (contents.length) {
            content.html = contents.join('').replaceAll(
              'src="', `src="${data.link}`
            )
          }
          setContent({ ...content })
        })
        .catch(err => {
          setLoading(false)
        })
    }, [])

  return <Fragment>
    {/* BLOCK AS BUTTON */}
    {
      !isRoot ?
        <div
          tabIndex="-1"
          className='section'
          onClick={_ => {
            if (!loading) {
              setOpen(true)
            }
          }}
        >
          <div className='left'
               style={!content.thumbnail ? { backgroundColor: "white" } : {}}>
            {
              content.thumbnail ? <img src={content.thumbnail}/> : null
            }
          </div>
          {
            !loading ?
              <div className='right'>
                <div className='title'>{content.title}</div>
                <div className='content'>{content.description}</div>
              </div> :
              <div className='right'>
                <div className='Throbber'>
                  <CircularProgress/> Loading information...
                </div>
              </div>
          }
        </div> : null
    }

    {/* CONTENT */}
    <div className={'HelpCenter-Block ' + (open ? 'Open' : '')}>
      <div className='title'>
        {
          !isRoot ? <ArrowForwardIcon onClick={_ => {
            setOpen(false)
          }}/> : null
        }
        {content.title}
      </div>
      {
        content.html ?
          <div dangerouslySetInnerHTML={{ __html: content.html }}></div> :
          null
      }
      {
        data.blocks?.map((row, idx) => {
          return <Block key={idx} data={row}/>
        })
      }
      <a
        tabIndex="-1"
        href={data.link}
        target={'_blank'}
        className='link'>
        Visit our Documentation <ArrowForwardIcon/>
      </a>
    </div>
  </Fragment>
}