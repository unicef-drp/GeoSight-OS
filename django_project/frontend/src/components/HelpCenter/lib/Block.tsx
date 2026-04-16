/**
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '22/08/2023'
 */

import React, { Fragment, useEffect, useState } from 'react';
import { ArrowForwardIcon } from "./Icons";
import BlockGrid from "./BlockGrid";
import CircularProgress from "@mui/material/CircularProgress";

export interface BlockDataInterface {
  title?: string,
  description?: string,
  thumbnail?: string,
  anchor?: string,
  link: string,
  html?: string,
  blocks?: BlockDataInterface[]
}

export interface BlockInterface {
  id: number;
  data: BlockDataInterface;
  autogenerateBlocks: boolean;
  isRoot: boolean;
  openedChild: number;
  setOpenedChild: React.Dispatch<React.SetStateAction<number>>;
}

/** Block help. **/
export default function Block(props: BlockInterface) {
  const [currOpenedChild, setCurrOpenedChild] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true)
  const { id, data, isRoot, openedChild, setOpenedChild } = props
  const [blocks, setBlocks] = useState<BlockDataInterface[]>(data.blocks ? data.blocks : []);

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
      if (!content.description && element.innerText) {
        content.description = element.innerText
      }
      if (!content.thumbnail && element.getElementsByTagName('img') && element.getElementsByTagName('img')[0]) {
        try {
          const source = element.getElementsByTagName('img')[0].outerHTML.split('src="')[1].split('"')[0]
          content.thumbnail = source
          if (source[0] !== 'h') {
            content.thumbnail = data.link + source
          }
        } catch (err) {
        }
      }
      return [element.outerHTML].concat(getContents(content, element.nextElementSibling, false))
    }
    return []
  }

  useEffect(
    () => {
      if (id === openedChild && loading) {
        fetch(data.link)
          .then(response => response.text())
          .then((response) => {
            setLoading(false)
            const parser = new DOMParser()
            const htmlDoc = parser.parseFromString(response, 'text/html')
            {
              const anchor = data.anchor?.replace('#', '')
              let _element = htmlDoc.getElementsByTagName('article')[0]
              if (anchor) {
                // @ts-ignore
                _element = htmlDoc.getElementById(data.anchor.replace('#', ''))
              } else if (_element) {
                // @ts-ignore
                if (htmlDoc.getElementsByTagName('h1')[0]) {
                  _element = htmlDoc.getElementsByTagName('h1')[0]
                } else {
                  // @ts-ignore
                  _element = _element.children[0]
                }
              }
              if (!_element) return

              // Get the title
              if (!content.title) {
                content.title = _element.innerText.replaceAll('¶', '')
              }

              if (!data.html) {
                // Get the contents
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
                  ).replaceAll('href', 'target="__blank__" href')
                }
              }
              setContent({ ...content })
            }
            // Generate blocks if autogenerate
            if (props.autogenerateBlocks) {
              try {
                const activeNavs = htmlDoc.getElementsByClassName('md-sidebar')[0].getElementsByClassName('md-nav__item--active')
                const activeNav = activeNavs[activeNavs.length - 1]
                if (activeNav.className.includes('md-nav__item--nested')) {
                  const childNav = activeNav.getElementsByTagName('nav')[0]
                  const children = childNav.getElementsByTagName('ul')[0].children
                  const blocks = []
                  for (let i = 0; i < children.length; i++) {
                    const child = children[i]
                    const elLink = child.getElementsByTagName('a')[0]
                    if (elLink) {
                      const href = elLink.getAttribute("href")
                      const block = {
                        title: elLink.innerText,
                        link: new URL(href ? href : '', data.link).href
                      }
                      blocks.push(block)
                    }
                  }
                  setBlocks(blocks)
                }
              } catch (err) {
              }

            }
            setContent({ ...content })
          })
      }
    }, [openedChild]
  )

  return <Fragment>
    {/* CONTENT */}
    <div
      className={'DocsCrawler-Block ' + (id === openedChild ? 'Open' : '')}>
      <div className='title'>
        {
          !isRoot ? <ArrowForwardIcon onClick={() => {
            setOpenedChild(-1)
          }}/> : null
        }
        {content.title}
      </div>
      {
        !loading ?
          <>
            {
              content.html ?
                <div
                  dangerouslySetInnerHTML={{ __html: content.html }}></div> :
                null
            }
            {
              blocks.map((row, idx) => {
                return <BlockGrid
                  key={idx} id={idx} data={row} isRoot={false}
                  setOpenedChild={setCurrOpenedChild}
                />
              })
            }
          </> :
          <div className='right'>
            <div className='Throbber'>
              <CircularProgress/> Loading information...
            </div>
          </div>
      }

      <a
        tabIndex={-1}
        href={data.link + (data.anchor ? data.anchor : '')}
        target={'_blank'}
        className='link'>
        Visit our Documentation <ArrowForwardIcon/>
      </a>
    </div>
    {
      blocks.map((row, idx) => {
        return <Block
          key={idx} id={idx}
          data={row}
          autogenerateBlocks={props.autogenerateBlocks}
          isRoot={false}
          openedChild={currOpenedChild}
          setOpenedChild={setCurrOpenedChild}
        />
      })
    }
  </Fragment>
}