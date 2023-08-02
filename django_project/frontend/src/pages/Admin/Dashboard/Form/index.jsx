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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import MapIcon from '@mui/icons-material/Map';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ReplayIcon from '@mui/icons-material/Replay';
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import CircularProgress from '@mui/material/CircularProgress';

import App, { render } from '../../../../app';
import { pageNames } from '../../index';
import { Actions, store } from '../../../../store/dashboard';
import SideNavigation from "../../Components/SideNavigation";
import Dashboard from "../../../Dashboard/index";
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import { dictDeepCopy } from "../../../../utils/main";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";

// Dashboard Form
import SummaryDashboardForm from './Summary'
import IndicatorsForm from './Indicators'
import IndicatorLayersForm from './IndicatorLayers'
import ContextLayerForm from './ContextLayer'
import BasemapsForm from './Basemaps'
import WidgetForm from './Widgets'
import RelatedTableForm from './RelatedTable'
import FiltersForm from './Filters'
import ShareForm from './Share'

// Dashboard Preview
import { postData } from "../../../../Requests";

// Georepo authorization
import GeorepoAuthorizationModal
  from "../../../../components/B2C/GeorepoAuthorizationModal";

import '../../../Dashboard/style.scss';
import './style.scss';
import { dataFieldsDefault } from "../../../../utils/indicatorLayer";


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

  return <Fragment>
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
  </Fragment>
}

/**
 * Dashboard Save Form
 */
export function DashboardSaveForm(
  {
    currentPage,
    disabled,
    setCurrentHistoryIdx
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
    levelConfig
  } = useSelector(state => state.dashboard.data);
  const { data } = useSelector(state => state.dashboard);
  const filtersData = useSelector(state => state.filtersData);
  const [submitted, setSubmitted] = useState(false);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** On save **/
  const onSave = (event) => {
    setSubmitted(true)
    const target = event.currentTarget
    const errors = [];
    const name = $('#SummaryName').val();
    const slug = $('#SummarySlug').val();
    const description = $('#SummaryDescription textarea').val();
    const icon = $('#SummaryIcon')[0].files[0];
    const category = $('#SummaryCategory').val();
    const splashScreen = $('#SummarySplash').is(':checked');
    const truncateIndicatorName = $('#SummaryTruncateIndicatorName').is(':checked');

    if (!name) {
      errors.push('Name is empty, please fill it.')
    }
    if (Object.keys(referenceLayer).length === 0 || !referenceLayer.identifier) {
      errors.push('Need to select Reference Dataset in Summary.')
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
        'filters': filtersData ? filtersData : filters,
        'filters_allow_modify': filtersAllowModify,
        'permission': permission,
        'show_splash_first_open': splashScreen,
        'truncate_indicator_layer_name': truncateIndicatorName
      }

      // onOpen();
      var formData = new FormData()
      formData.append('slug', slug)
      formData.append('icon', icon)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('group', category)
      formData.append('data', JSON.stringify(dashboardData))
      formData.append('geoField', geoField)
      formData.append('show_splash_first_open', splashScreen)
      formData.append('truncate_indicator_layer_name', truncateIndicatorName)

      postData(
        document.location.href,
        formData,
        function (response, responseError) {
          setSubmitted(false)
          if (responseError) {
            notify('' + responseError, NotificationStatus.ERROR)
          } else {
            if (!id) {
              window.location = response.url
            } else if (window.location.href !== response.url) {
              window.location = response.url
            } else {
              notify('Configuration has been saved!', NotificationStatus.SUCCESS)
              histories = [{
                page: currentPage,
                data: JSON.parse(JSON.stringify(data))
              }]
              setCurrentHistoryIdx(0)

            }
          }
        }
      )
    } else {
      notify(errors.join(' '), NotificationStatus.ERROR)
      setSubmitted(false)
    }
  }

  return <Fragment>
    <SaveButton
      variant="primary"
      text={submitted ? 'Saving...' : 'Save'}
      onClick={onSave}
      className={submitted ? 'Submitted' : ''}
      disabled={disabled || submitted || !Object.keys(data).length}/>
    <Notification ref={notificationRef}/>
  </Fragment>
}

/**
 * Dashboard Form Section Content
 */
export function DashboardFormContent({ changed }) {
  const { data } = useSelector(state => state.dashboard);
  return (
    <div className='DashboardFormContent'>
      {Object.keys(data).length > 0 ?
        <Fragment>
          <SummaryDashboardForm changed={changed}/>
          <BasemapsForm/>
          <IndicatorsForm/>
          <IndicatorLayersForm/>
          <ContextLayerForm/>
          <FiltersForm/>
          <WidgetForm/>
          <RelatedTableForm/>
          {
            data?.user_permission.share ? <ShareForm/> : ""
          }
        </Fragment> :
        <div className='DashboardFormLoading'>
          <div className='DashboardFormLoadingSection'>
            <CircularProgress/>
            <div>
              Fetching project data...
            </div>
          </div>
        </div>
      }
    </div>
  )
}

/**
 * Dashboard Form Section Content
 */
export function DashboardFormHeader(
  { currentPage, changePage, user_permission }) {
  const {
    indicators,
    indicatorLayers,
    basemapsLayers,
    contextLayers,
    relatedTables,
    widgets
  } = useSelector(state => state.dashboard.data);
  return <div className='DashboardFormHeader TabPrimary'>
    <div
      className={currentPage === 'Summary' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Summary')}
    >
      General
    </div>
    <div
      className={currentPage === 'Indicators' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Indicators')}
    >
      Indicators {indicators?.length ? `(${indicators?.length})` : null}
    </div>
    <div
      className={currentPage === 'Indicator Layers' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Indicator Layers')}
    >
      Indicator
      Layers {indicatorLayers?.length ? `(${indicatorLayers?.length})` : null}
    </div>
    <div
      className={currentPage === 'Context Layers' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Context Layers')}
    >
      Context
      Layers {contextLayers?.length ? `(${contextLayers?.length})` : null}
    </div>
    <div
      className={currentPage === 'Basemaps' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Basemaps')}
    >
      Basemaps {basemapsLayers?.length ? `(${basemapsLayers?.length})` : null}
    </div>
    <div
      className={currentPage === 'Filters' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Filters')}
    >
      Filters
    </div>
    <div
      className={currentPage === 'Widgets' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('Widgets')}
    >
      Widgets {widgets?.length ? `(${widgets?.length})` : null}
    </div>
    <div
      className={currentPage === 'RelatedTables' ? 'Selected' : 'MuiButtonLike'}
      onClick={() => changePage('RelatedTables')}
    >
      Related
      Tables {relatedTables?.length ? `(${relatedTables?.length})` : null}
    </div>
    {
      user_permission?.share ?
        <div
          className={currentPage === 'Share' ? 'Selected' : 'MuiButtonLike'}
          onClick={() => changePage('Share')}
        >
          Share
        </div> : ""
    }
  </div>
}

/**
 * Dashboard Form Section
 */
export function DashboardForm({ onPreview }) {
  const {
    user_permission,
    permission
  } = useSelector(state => state.dashboard.data);
  const [currentPage, setCurrentPage] = useState('Summary');
  const [currentHistoryIdx, setCurrentHistoryIdx] = useState(-1);
  const [changed, setChanged] = useState(false);
  const className = currentPage.replaceAll(' ', '')
  return (
    <div className='Admin'>
      <SideNavigation pageName={pageNames.Dashboard}/>
      <div className='AdminContent'>
        <div className='AdminContentHeader'>
          <div className='AdminContentHeader-Left'>
            <b className='light'
               dangerouslySetInnerHTML={{ __html: contentTitle }}></b>
          </div>
          <div className='AdminContentHeader-Right'>
            <DashboardHistory
              page={currentPage}
              setCurrentPage={setCurrentPage}
              currentHistoryIdx={currentHistoryIdx}
              setCurrentHistoryIdx={setCurrentHistoryIdx}/>
            <ThemeButton
              variant="primary"
              onClick={onPreview}
            >
              <MapIcon/>Preview
            </ThemeButton>
            <DashboardSaveForm
              currentPage={currentPage}
              disabled={currentHistoryIdx <= 0 && !changed}
              setCurrentHistoryIdx={setCurrentHistoryIdx}/>
          </div>
          {
            permission?.public_permission !== 'Read' && preferences.georepo_api.api_key_is_public ?
              <GeorepoAuthorizationModal/> : null
          }
        </div>

        {/* DASHBOARD FORM */}
        <div className='DashboardFormWrapper'>
          <div className={'AdminForm DashboardForm ' + className}>
            {/* FORM CONTENT */}
            <DashboardFormHeader
              currentPage={currentPage} changePage={setCurrentPage}
              user_permission={user_permission}/>

            {/* FORM CONTENT */}
            <DashboardFormContent changed={setChanged}/>
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
  const [currentMode, setCurrentMode] = useState('FormMode');
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
