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

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ReplayIcon from '@mui/icons-material/Replay';
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

import App, { render } from '../../../../app';
import { pageNames } from '../../index';
import { Actions, store } from '../../../../store/dashboard';
import SideNavigation from "../../Components/SideNavigation";
import Dashboard from "../../../Dashboard/index";
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import { dictDeepCopy, slugify } from "../../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";

// Dashboard Form
import GeorepoAuthorizationModal
  from "../../../../components/GeorepoAuthorizationModal";
import { resourceActions } from "../List";

// Dashboard Preview
import { postData } from "../../../../Requests";
import { dataFieldsDefault } from "../../../../utils/indicatorLayer";
import { MapActiveIcon } from "../../../../components/Icons";

import '../../../Dashboard/style.scss';
import './style.scss';
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";
import DashboardFormContent from "./DashboardContent";
import { PAGES } from "./types.d";
import DashboardFormHeader from "./DashboardFormHeader";


/**
 * Dashboard history
 */

let histories = [];
let forceChangedDataStr = null;

export function DashboardHistory(
  {
    page,
    setCurrentPage,
    currentHistoryIdx,
    setCurrentHistoryIdx
  }) {
  const dispatch = useDispatch();
  const { data } = useSelector(state => state.dashboard);

  const applyHistory = (targetIdx, page) => {
    const history = histories[targetIdx]
    const data = history.data
    forceChangedDataStr = JSON.stringify(data)
    dispatch(
      Actions.Dashboard.update(dictDeepCopy(data))
    )
    setCurrentPage(page)
    setCurrentHistoryIdx(targetIdx)
  }

  const undo = () => {
    const currentHistory = histories[currentHistoryIdx]
    applyHistory(currentHistoryIdx - 1, currentHistory.page)
  }

  const redo = () => {
    const history = histories[currentHistoryIdx + 1]
    applyHistory(currentHistoryIdx + 1, history.page)
  }

  const reset = () => {
    const history = histories[0]
    applyHistory(0, history.page)
  }

  // Add history
  useEffect(() => {
    if (data.extent) {
      const strData = JSON.stringify(data)
      if (forceChangedDataStr !== strData) {
        const lastHistory = histories[currentHistoryIdx];
        histories = histories.slice(0, currentHistoryIdx + 1);
        if (!lastHistory || (lastHistory && strData !== JSON.stringify(lastHistory.data))) {
          const newHistoryIdx = currentHistoryIdx + 1
          const newHistory = {
            page: page,
            data: dictDeepCopy(data)
          }
          histories[newHistoryIdx] = newHistory
          setCurrentHistoryIdx(newHistoryIdx)
        }
      }
    }
  }, [data]);

  const redoDisabled = (
    histories.length <= 1 || histories.length - 1 === currentHistoryIdx
  )

  return <>
    <ThemeButton
      variant='primary Reverse JustIcon'
      className='UndoRedo'
      onClick={undo}
      disabled={currentHistoryIdx <= 0}
    >
      <UndoIcon/>
    </ThemeButton>
    <ThemeButton
      variant='primary Reverse JustIcon'
      className='UndoRedo'
      onClick={reset}
      disabled={currentHistoryIdx <= 0}
    >
      <ReplayIcon/>
    </ThemeButton>
    <ThemeButton
      variant='primary Reverse JustIcon'
      className='UndoRedo'
      onClick={redo}
      disabled={redoDisabled}
    >
      <RedoIcon/>
    </ThemeButton>
  </>
}

export function DashboardSaveAsForm({ submitted, onSaveAs }) {
  const [openSaveAs, setOpenSaveAs] = useState(false);
  const [nameData, setNameData] = useState('');
  const [slugInput, setSlugInput] = useState('');

  useEffect(() => {
    if (openSaveAs) {
      setNameData($('#GeneralName').val())
      setSlugInput($('#GeneralSlug').val())
    }
  }, [openSaveAs]);

  useEffect(() => {
    $('#GeneralName').val(nameData)
  }, [nameData]);

  useEffect(() => {
    $('#GeneralSlug').val(slugInput)
  }, [slugInput]);

  return <>
    <Modal
      className='SaveAsModal'
      open={openSaveAs}
      onClosed={() => {
        setOpenSaveAs(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpenSaveAs(false)
      }}>
        <b>Save project as...</b>
      </ModalHeader>
      <ModalContent>
        <div className="BasicForm">
          <div className="BasicFormSection">
            <div>
              <label className="form-label required" htmlFor="name">
                Name
              </label>
            </div>
            <div>
              <span className="form-input">
              <input
                id="GeneralName" type="text" name="name" required={true}
                placeholder='Example: Afghanistan Risk Dashboard'
                value={nameData}
                onChange={(event) => {
                  setNameData(event.target.value)
                  setSlugInput(slugify(event.target.value))
                }}/>
              </span>
            </div>
            <br/>
            <label className="form-label" htmlFor="name">
              URL Shortcode
            </label>
            <div>
            <span className="form-input">
            <input
              type="text" name="name" required={true}
              value={slugInput}
              onChange={(event) => {
                setSlugInput(slugify(event.target.value))
              }}/>
            </span>
            </div>
            <span className='form-helptext'>
              Url of project in slug format. It will auto change space to "-" and to lowercase.
              It will be generated from name if empty.
              <br/>
              Please change it if it is same with the origin one.
            </span>
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <div style={{ display: "flex" }}>
          <div className='Separator'/>
          <ThemeButton
            variant="Basic Reverse"
            onClick={() => {
              setOpenSaveAs(false)
            }}>
            Cancel
          </ThemeButton>
          <SaveButton
            variant="primary"
            text='Create'
            onClick={() => {
              onSaveAs()
            }}/>
        </div>
      </ModalFooter>
    </Modal>
    <SaveButton
      variant="primary"
      text={submitted ? 'Creating...' : 'Save as'}
      onClick={() => {
        setOpenSaveAs(true)
      }}
      className={submitted ? 'Submitted' : ''}
      disabled={submitted}
    />
  </>
}

/**
 * Dashboard Save Form
 */
export function DashboardSaveForm(
  {
    currentPage,
    disabled,
    setCurrentHistoryIdx,
    setChanged
  }) {
  const {
    id,
    referenceLayer,
    indicatorLayers,
    indicatorLayersStructure,
    indicators,
    basemapsLayers,
    basemapsLayersStructure,
    contextLayers,
    contextLayersStructure,
    relatedTables,
    widgets,
    widgetsStructure,
    extent,
    filters,
    filtersAllowModify,
    permission,
    geoField,
    levelConfig,
    default_time_mode,
    tools
  } = useSelector(state => state.dashboard.data);
  const { data } = useSelector(state => state.dashboard);
  const [submitted, setSubmitted] = useState(false);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** On save **/
  const onSave = (targetUrl = document.location.href) => {
    setSubmitted(true)
    const errors = [];
    const name = $('#GeneralName').val();
    const slug = $('#GeneralSlug').val();
    const description = $('#GeneralDescription').val();
    const overview = $('#GeneralOverview').val();
    const icon = $('#GeneralIcon')[0].files[0];
    const category = $('#GeneralCategory .ReactSelect__single-value').text();
    const splashScreen = $('#GeneralSplash').is(':checked');
    const truncateIndicatorName = $('#GeneralTruncateIndicatorName').is(':checked');
    const enableGeometrySearch = $('#GeneralEnableGeometrySearch').is(':checked');

    if (!name) {
      errors.push('Name is empty, please fill it.')
    }
    if (Object.keys(referenceLayer).length === 0 || !referenceLayer.identifier) {
      errors.push('Need to select View in General.')
    }
    if (basemapsLayers.length === 0) {
      errors.push('Basemap is empty, please select one or more basemap.')
    }
    // Check widget error
    if ($('.widget__error').length > 0) {
      let error = false
      $('.widget__error').each(function () {
        if ($(this).html() !== "You don't have permission to access this resource") {
          error = true
        }
      })
      if (error) {
        errors.push('There is widget that error, please check it in review mode.')
      }
    }

    // Submit dashboard
    if (errors.length === 0) {
      const dashboardData = {
        'reference_layer': referenceLayer.identifier,
        'level_config': levelConfig,
        'indicator_layers': dictDeepCopy(indicatorLayers).map(indicatorLayer => {
          if (indicatorLayer.data_fields && JSON.stringify(indicatorLayer.data_fields) === JSON.stringify(dataFieldsDefault())) {
            indicatorLayer.data_fields = null
          }
          return indicatorLayer
        }),
        'indicator_layers_structure': indicatorLayersStructure,
        'context_layers': contextLayers.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            data_fields: model.data_fields,
            styles: JSON.stringify(model.styles),
            label_styles: JSON.stringify(model.label_styles),
            override_style: model.override_style,
            override_label: model.override_label,
            override_field: model.override_field,
            configuration: model.configuration,
          }
        }),
        'context_layers_structure': contextLayersStructure,
        'indicators': indicators.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            group: model.group,
            override_style: model.override_style,
            style: model.style,
            style_id: model.style_id,
            style_type: model.style_type,
            style_config: model.style_config,
            override_label: model.override_label,
            label_config: model.label_config,
          }
        }),
        'basemaps_layers': basemapsLayers.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            group: model.group,
            group_parent: model.group_parent
          }
        }),
        'basemaps_layers_structure': basemapsLayersStructure,
        'related_tables': relatedTables.map(function (model) {
          return {
            id: model.id,
            selected_related_fields: model.selected_related_fields,
            geography_code_field_name: model.geography_code_field_name,
            geography_code_type: model.geography_code_type,
            order: model.order,
            query: model.query,
          }
        }),
        'extent': extent,
        'widgets': widgets,
        'widgets_structure': widgetsStructure,
        'filters': filters,
        'filters_allow_modify': filtersAllowModify,
        'permission': permission,
        'show_splash_first_open': splashScreen,
        'truncate_indicator_layer_name': truncateIndicatorName,
        'enable_geometry_search': enableGeometrySearch,
        'tools': tools
      }

      // onOpen();
      var formData = new FormData()
      if (data.id) {
        formData.append('origin_id', data.id)
      }
      formData.append('slug', slug)
      formData.append('icon', icon)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('overview', overview)
      formData.append('group', category)
      formData.append('data', JSON.stringify(dashboardData))
      formData.append('geoField', geoField)
      formData.append('show_splash_first_open', splashScreen)
      formData.append('truncate_indicator_layer_name', truncateIndicatorName)
      formData.append('enable_geometry_search', enableGeometrySearch)
      formData.append('default_time_mode', JSON.stringify(default_time_mode))

      postData(
        targetUrl,
        formData,
        function (response, responseError) {
          setSubmitted(false)
          if (responseError) {
            notify('' + responseError, NotificationStatus.ERROR)
          } else {
            const currUrl = window.location.href.split('#')[0]
            if (!id) {
              window.location = response.url
            } else if (currUrl !== response.url) {
              window.location = response.url
            } else {
              notify('Configuration has been saved!', NotificationStatus.SUCCESS)
              histories = [{
                page: currentPage,
                data: JSON.parse(JSON.stringify(data))
              }]
              setCurrentHistoryIdx(0)
              setChanged(false)
            }
          }
        }
      )
    } else {
      notify(errors.join(' '), NotificationStatus.ERROR)
      setSubmitted(false)
    }
  }

  return <>
    {
      id ?
        <DashboardSaveAsForm
          submitted={submitted}
          onSaveAs={() => {
            onSave('/admin/project/create')
          }}/> : null
    }
    <SaveButton
      variant="primary"
      text={submitted ? 'Saving...' : 'Save'}
      onClick={() => {
        onSave()
      }}
      className={submitted ? 'Submitted' : ''}
      disabled={disabled || submitted || !Object.keys(data).length}/>
    <Notification ref={notificationRef}/>
  </>
}

/**
 * Dashboard Form Section
 */
export function DashboardForm({ onPreview }) {
  const {
    user_permission,
    id,
    name
  } = useSelector(state => state.dashboard.data);
  const [currentPage, setCurrentPage] = useState(PAGES.GENERAL);
  const [currentHistoryIdx, setCurrentHistoryIdx] = useState(-1);
  const [changed, setChanged] = useState(false);
  const className = currentPage.replaceAll(' ', '')
  return (
    <div className='Admin'>
      <SideNavigation pageName={pageNames.Dashboard} minified={true}/>
      <div className='AdminContent'>
        <GeorepoAuthorizationModal/>
        <div className='AdminContentHeader'>
          <div className='AdminContentHeader-Left'>
            <b className='light'
               dangerouslySetInnerHTML={{ __html: contentTitle }}></b>
          </div>
          <div className='AdminContentHeader-Right'>
            {
              id ?
                resourceActions({
                  id: id,
                  row: {
                    id,
                    name,
                    permission: user_permission
                  }
                }) : null
            }
            <DashboardHistory
              page={currentPage}
              setCurrentPage={setCurrentPage}
              currentHistoryIdx={currentHistoryIdx}
              setCurrentHistoryIdx={setCurrentHistoryIdx}/>
            <ThemeButton
              variant="primary"
              onClick={onPreview}
            >
              <MapActiveIcon/>Preview
            </ThemeButton>
            <DashboardSaveForm
              currentPage={currentPage}
              // disabled={currentHistoryIdx <= 0 && !changed}
              disabled={false}
              setCurrentHistoryIdx={setCurrentHistoryIdx}
              setChanged={setChanged}
            />
          </div>
        </div>

        {/* DASHBOARD FORM */}
        <div className='DashboardFormWrapper'>
          <div className={'AdminForm DashboardForm ' + className}>
            {/* FORM CONTENT */}
            <DashboardFormHeader
              page={currentPage}
              setPage={setCurrentPage}
            />

            {/* FORM CONTENT */}
            <DashboardFormContent page={currentPage}/>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard Form App
 */
export default function DashboardFormApp() {
  const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState('FormMode');

  // Change current mode
  useEffect(() => {
    dispatch(
      Actions.GlobalState.update({ editMode: currentMode === 'FormMode' })
    )
  }, [currentMode]);

  return (
    <App className={currentMode}>
      {/* ADMIN SECTION */}
      <DashboardForm onPreview={() => {
        setCurrentMode('PreviewMode')
      }}/>
      {/* DASHBOARD SECTION */}
      <Dashboard>
        <div className='BackToForm'>
          <ThemeButton
            variant="primary"
            onClick={() => {
              setCurrentMode('FormMode')
            }}
          >
            <ViewHeadlineIcon/>Back to Form
          </ThemeButton>
        </div>
      </Dashboard>
    </App>
  )
}

render(DashboardFormApp, store)
