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

import React, { Fragment, useEffect, useState } from 'react';
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
import { fetchingData } from "../../../../Requests";
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
import { dictDeepCopy } from "../../../../utils/main";
import {
  changeIndicatorLayersForcedUpdate
} from "../../LeftPanel/IndicatorLayers";
import { compareFilters, filtersToFlatDict } from "../../../../utils/filters";

import './style.scss';

/**
 * Bookmark component.
 */
export default function Bookmark({ map }) {
  const dispatch = useDispatch();
  const isEmbed = EmbedConfig().id;
  const dashboardData = useSelector(state => state.dashboard.data);
  const filtersData = useSelector(state => state.filtersData);
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer);
  const selectedIndicatorSecondLayer = useSelector(state => state.selectedIndicatorSecondLayer);
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel);
  const selectedBookmark = useSelector(state => state.selectedBookmark);
  const {
    basemapLayer,
    contextLayers,
    indicatorShow,
    contextLayersShow,
    is3dMode
  } = useSelector(state => state.map)

  // Extent
  const bounds = map?.getBounds()
  let extent = null
  if (bounds) {
    extent = [
      bounds._sw.lng, bounds._sw.lat,
      bounds._ne.lng, bounds._ne.lat
    ]
  }

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Bookmarks
  const [bookmarks, setBookmarks] = useState(null)
  const [saveBookmarkID, setSaveBookmarkID] = useState(null)
  /***
   * Get data of bookmark
   */
  const data = () => {
    const selectedIndicatorLayers = [selectedIndicatorLayer?.id]
    if (selectedIndicatorSecondLayer?.id) {
      selectedIndicatorLayers.push(selectedIndicatorSecondLayer?.id)
    }
    return {
      name: name,
      selectedBasemap: basemapLayer?.id,
      selectedIndicatorLayers: selectedIndicatorLayers,
      selectedContextLayers: Object.keys(contextLayers).map(id => parseInt(id)),
      filters: filtersData,
      extent: extent,
      indicatorShow: indicatorShow,
      contextLayersShow: contextLayersShow,
      selectedAdminLevel: selectedAdminLevel.level,
      is3dMode: is3dMode,
      position: JSON.stringify({
        pitch: map?.getPitch(),
        bearing: map?.getBearing(),
        zoom: map?.getZoom(),
        center: map?.getCenter(),
      })
    }
  }

  /** Update dashboard data with new bookmark */
  const updateDashboardData = (bookmark) => {
    dispatch(
      Actions.Map.update({
          is3dMode: bookmark?.is_3d_mode,
          position: bookmark.position
        }
      )
    )
    const newDashboard = dictDeepCopy(dashboardData)
    newDashboard.basemapsLayers.map(layer => {
      layer.visible_by_default = layer.id === bookmark.selected_basemap
    })

    // Activate compare
    if (bookmark.selected_indicator_layers?.length >= 2) {
      dispatch(Actions.MapMode.activateCompare())
    } else {
      dispatch(Actions.MapMode.deactivateCompare())
    }
    newDashboard.contextLayers.map(layer => {
      layer.visible_by_default = bookmark.selected_context_layers.includes(layer.id)
    })
    newDashboard.filters = compareFilters(
      newDashboard.filters, filtersToFlatDict(bookmark.filters)
    )
    changeIndicatorLayersForcedUpdate(bookmark.selected_indicator_layers)
    setTimeout(function () {
      dispatch(
        Actions.Dashboard.update(JSON.parse(JSON.stringify(newDashboard)))
      )
    }, 100)
    dispatch(Actions.Map.showHideContextLayer(bookmark?.context_layer_show))
    dispatch(Actions.Map.showHideIndicator(bookmark?.indicator_layer_show))

    if (bookmark.selected_admin_level !== null) {
      dispatch(Actions.SelectedAdminLevel.change({
        level: bookmark.selected_admin_level
      }))
    }
  }

  /** Fetch bookmark list
   */
  const fetchBookmarks = () => {
    setBookmarks(null)
    fetchingData(urls.bookmarkList, {}, {}, (data) => {
      setBookmarks(data)
    }, false)
  }

  // Change selected bookmark when there is embed config
  useEffect(() => {
    fetchBookmarks()
    if (map) {
      const defaultBookmark = EmbedConfig().bookmark
      if (defaultBookmark) {
        dispatch(Actions.SelectedBookmark.change(defaultBookmark))
        updateDashboardData(defaultBookmark)
      }
    }
  }, [map])

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
  const save = (url) => {
    $.ajax({
      url: url,
      data: {
        data: JSON.stringify(data())
      },
      type: 'POST',
      dataType: 'json',
      success: function (response, textStatus, request) {
        fetchBookmarks()
        setOpen(false)
        dispatch(Actions.SelectedBookmark.change({ ...response }))
      },
      error: function (error, textStatus, errorThrown) {
        if (error.responseText) {
          setError(error.responseText);
        } else {
          try {
            setError(error.responseJSON.detail);
          } catch (err) {
            setError(error.statusText);
          }
        }
      },
      beforeSend: beforeAjaxSend
    });
  }
  // on save data
  const onSaveAs = () => {
    save(urls.bookmarkCreate)
  }
  // on save data
  const onSave = (id) => {
    save(urls.bookmarkDetail.replaceAll('/0', `/${id}`))
  }

  const bookmarkSave = bookmarks ? bookmarks.find(
    row => row.id === saveBookmarkID) : null

  if (!dashboardData.id) {
    return ""
  }
  return (
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
          <PluginChild title={'Bookmark'} disabled={!filtersData}>
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
                                          url: urls.bookmarkDetail.replaceAll('/0', `/${bookmark.id}`),
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
            disabled={!name || !basemapLayer || !extent || !selectedIndicatorLayer}/>
        </ModalFooter>
      </Modal>
    </CustomPopover>
  )
}