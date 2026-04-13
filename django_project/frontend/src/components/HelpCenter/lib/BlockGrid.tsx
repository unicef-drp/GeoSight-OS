/**
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '22/08/2023'
 */

import React, { Fragment, useEffect, useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import { BlockDataInterface } from "./Block"

export interface BlockInterface {
  id: number;
  data: BlockDataInterface;
  isRoot: boolean;
  setOpenedChild: React.Dispatch<React.SetStateAction<number>>;
}

/** Block help. **/
export default function BlockGrid(props: BlockInterface) {
  const [loading, setLoading] = useState(true)
  const { id, data, isRoot, setOpenedChild } = props
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
  const getContents = (content: { title?: string; description: any; thumbnail: any; html?: string; }, element: any, root: boolean): any[] => {
    if (element && (root || !data.anchor || (data.anchor && !element.id))) {
      if (!content.description && element.innerText && element.tagName.toLowerCase() === 'p') {
        content.description = element.innerText.replaceAll('¶', '').split('.')[0]
      }
      if (!content.thumbnail && element.getElementsByTagName('img') && element.getElementsByTagName('img')[0]) {
        try {
          const source = element.getElementsByTagName('img')[0].outerHTML.split('src="')[1].split('"')[0]
          content.thumbnail = source
          if (source[0] !== 'h') {
            content.thumbnail = data.link + source
          }
        } catch (err) {
          console.log(err)
        }
      }
      return [element.outerHTML].concat(getContents(content, element.nextElementSibling, false))
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
          const anchor = data.anchor?.replace('#', '')
          let _element = htmlDoc.getElementsByTagName('article')[0]
          if (anchor) {
            // @ts-ignore
            _element = htmlDoc.getElementById(data.anchor.replace('#', ''))
          } else if (_element) {
            // @ts-ignore
            _element = htmlDoc.getElementsByTagName('h1')[0]
          }
          if (!_element) return
          if (!content.title) {
            content.title = _element.innerText.replaceAll('¶', '')
          }
          const contents = getContents(content, _element.nextElementSibling, true)
          if (contents.length) {
            content.html = contents.join('').replaceAll(
              /src="[^h]/g, function (found: string) {
                return found.replace('src="', `src="${data.link}`)
              }
            ).replaceAll(
              /href="[^h]/g, function (found: string) {
                return found.replace('href="', `href="${data.link}`)
              }
            ).replaceAll('¶', '')
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
          className='section'
          onClick={_ => {
            if (!loading) {
              setOpenedChild(id)
            }
          }}
        >
          <div className='left'>
            {
              content.thumbnail ?
                <img src={content.thumbnail}/> : null
            }
          </div>
          {
            !loading ?
              <div className='right'>
                <div className='title'>{content.title}</div>
                <div
                  className='content'>{content.description}</div>
              </div> :
              <div className='right'>
                <div className='Throbber'>
                  <CircularProgress/> Loading information...
                </div>
              </div>
          }
        </div> : null
    }
  </Fragment>
}