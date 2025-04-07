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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Bookmark
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import TextField from "@mui/material/TextField";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import {
  EditIcon,
  StarOffIcon,
  StarOnIcon
} from "../../../../components/Icons";
import { DjangoRequests, fetchingData } from "../../../../Requests";
import { Actions } from '../../../../store/dashboard'
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";
import CustomPopover from "../../../../components/CustomPopover";
import { PluginChild } from "../../MapLibre/Plugin";
import { EmbedConfig } from "../../../../utils/embed";
import { ProjectCheckpoint } from "../../../../components/ProjectCheckpoint";

import './style.scss';

/** Bookmark component. */
export default function Bookmark({ map }) {
  // Project point states
  const projectCheckpointRef = useRef(null);
  const [projectCheckpointEnable, setProjectCheckpointEnable] = useState(false)

  const dispatch = useDispatch();
  const isEmbed = EmbedConfig().id;
  const { id, slug } = useSelector(state => state.dashboard.data);
  const selectedBookmark = useSelector(state => state.selectedBookmark)

  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(null)
  const [saveBookmarkID, setSaveBookmarkID] = useState(null)

  /** Update dashboard data with new bookmark */
  const updateDashboardData = (bookmark) => {
    projectCheckpointRef.current.applyData(bookmark)
  }

  /** Fetch bookmark list
   */
  const fetchBookmarks = () => {
    setBookmarks(null)
    fetchingData(
      `/api/dashboard/${slug}/bookmarks`,
      {}, {},
      (data) => {
        setBookmarks(data)
      }, false)
  }

  // Change selected bookmark when there is embed config
  useEffect(() => {
    fetchBookmarks()
    if (map && id) {
      const defaultBookmark = EmbedConfig().bookmark
      if (defaultBookmark) {
        dispatch(Actions.SelectedBookmark.change(defaultBookmark))
        updateDashboardData(defaultBookmark)
      }
    }
  }, [map, id])

  const selectedBookmarkChanged = (selectedBookmark) => {
    if (bookmarks !== null) {
      const bookmark = bookmarks.find(row => row.id === selectedBookmark.id)
      if (selectedBookmark.position) {
        updateDashboardData(selectedBookmark)
      } else if (bookmark) {
        updateDashboardData(bookmark)
      }
    } else if (selectedBookmark.position) {
      updateDashboardData(selectedBookmark)
    }
  }
  // Update dashboard data when selected bookmark updated
  useEffect(() => {
    selectedBookmarkChanged(selectedBookmark)
  }, [selectedBookmark])

  /**
   * Save function based on url
   */
  const save = async (url) => {
    setUploading(true);
    const data = projectCheckpointRef.current.getData();
    try {
      const response = await DjangoRequests.post(url, { ...data, name: name })
      fetchBookmarks()
      setOpen(false)
      setUploading(false)
      dispatch(Actions.SelectedBookmark.change({ ...response.data }))
    } catch (err) {
      setError(err.toString());
      setUploading(false);
    }
  }

  // On save as data
  const onSaveAs = () => {
    save(`/api/dashboard/${slug}/bookmarks/create`)
  }

  // On save data
  const onSave = (id) => {
    save(`/api/dashboard/${slug}/bookmarks/${id}`)
  }

  const bookmarkSave = bookmarks ? bookmarks.find(
    row => row.id === saveBookmarkID
  ) : null

  if (!id) {
    return null
  }
  return <>
    <ProjectCheckpoint
      map={map}
      setProjectCheckpointEnable={setProjectCheckpointEnable}
      ref={projectCheckpointRef}
    />
    <CustomPopover
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      Button={
        <div className='Active'>
          <PluginChild title={'Bookmark'}>
            <a>
              <StarOffIcon/>
            </a>
          </PluginChild>
        </div>
      }>{/* LIST OF BOOKMARKS */}
      <div className='BookmarkComponent'>
        {
          !isEmbed ?
            <div className='Header'>

              <ThemeButton
                variant="primary-text"
                onClick={() => {
                  setSaveBookmarkID(null)
                  setOpen(true)
                  setName('')
                }}>
                <SaveAsIcon/> Save As...
              </ThemeButton>
            </div> : null
        }

        <div className='Body'>
          <table>
            <tbody>
            {
              bookmarks === null ? <tr>
                  <td>Loading</td>
                </tr> :
                <Fragment>
                  {
                    bookmarks.map(bookmark => {
                      return (
                        <tr
                          key={bookmark.id}
                          className={'Bookmark ' + (bookmark.id === selectedBookmark.id ? 'Selected' : '')}
                          onClick={() => {
                            dispatch(Actions.SelectedBookmark.change(bookmark))
                          }}
                        >
                          <td><StarOnIcon className='StarIcon'/></td>
                          <td>
                            <div>{bookmark.name}</div>
                          </td>
                          {
                            !isEmbed && bookmark.id && (user.is_staff || user.username === bookmark.creator) ?
                              <Fragment>
                                <td>
                                  <EditIcon
                                    className='EditIcon'
                                    onClick={(e) => {
                                      setSaveBookmarkID(bookmark.id)
                                      setOpen(true)
                                      setName(bookmark.name)
                                      e.stopPropagation()
                                    }}/>
                                  <HighlightOffIcon
                                    className='DeleteIcon'
                                    onClick={(e) => {
                                      if (confirm(`Are you sure you want to delete ${bookmark.name}?`)) {
                                        $.ajax({
                                          url: `/api/dashboard/${slug}/bookmarks/${bookmark.id}`,
                                          method: 'DELETE',
                                          success: function () {
                                            if (selectedBookmark.id === bookmark.id) {
                                              dispatch(
                                                Actions.SelectedBookmark.change({
                                                  id: 0,
                                                  name: 'Default'
                                                })
                                              )
                                            }
                                            fetchBookmarks()
                                          },
                                          beforeSend: beforeAjaxSend
                                        });
                                        e.stopPropagation()
                                      }
                                      e.stopPropagation()
                                    }}/>
                                </td>
                              </Fragment>
                              : <td></td>
                          }
                        </tr>
                      )
                    })
                  }
                </Fragment>
            }
            </tbody>
          </table>
        </div>
      </div>

      {/* SAVE MODAL */}
      <Modal
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {
            bookmarkSave ?
              <Fragment>
                {`Save bookmark ${bookmarkSave.name}`}
                <div className='helptext'>
                  {`Save current selection and extent to ${bookmarkSave.name}.`}
                </div>
              </Fragment> :
              <Fragment>
                Save bookmark as
                <div className='helptext'>
                  Save current selection and extent as new bookmark.
                </div>
              </Fragment>
          }
        </ModalHeader>
        <ModalContent>
          <TextField
            fullWidth label="Bookmark Name"
            value={name} onChange={(event) => {
            setName(event.target.value)
          }}/>
          {error ? <div className='error'>{error}</div> : ""}
        </ModalContent>
        <ModalFooter>
          <SaveButton
            variant="primary"
            text='Submit'
            onClick={() => {
              if (bookmarkSave) {
                onSave(bookmarkSave?.id)
              } else {
                onSaveAs()
              }
            }}
            disabled={
              !name || !projectCheckpointEnable || uploading
            }/>
        </ModalFooter>
      </Modal>
    </CustomPopover>
  </>
}