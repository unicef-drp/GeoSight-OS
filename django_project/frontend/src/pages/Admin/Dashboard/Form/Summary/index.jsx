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

import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { FormControl } from "@mui/material";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import MapConfig from './MapConfig'
import { Actions } from "../../../../../store/dashboard";
import { slugify } from "../../../../../utils/main";
import {
  ViewLevelConfiguration
} from "../../../Components/Input/ReferenceLayerLevelConfiguration";
import Grid from "@mui/material/Grid";
import {
  SelectWithSearch
} from "../../../../../components/Input/SelectWithSearch";
import { ImageInput } from "../../../../../components/Input/ImageInput";
import { Creatable } from "../../../../../components/Input";

import { INTERVALS } from "../../../../../utils/Dates";
import {
  SelectWithList
} from "../../../../../components/Input/SelectWithList";
import OverviewForm from "../Overview";
import GeorepoViewSelector
  from "../../../../../components/ResourceSelector/GeorepoViewSelector";

import './style.scss';

/**
 * Summary dashboard
 */
export default function SummaryDashboardForm({ changed }) {
  const {
    id,
    slug,
    icon,
    name,
    description,
    overview,
    group,
    referenceLayer,
    geoField,
    levelConfig,
    show_splash_first_open,
    truncate_indicator_layer_name,
    enable_geometry_search,
    default_time_mode
  } = useSelector(state => state.dashboard.data);
  const dispatch = useDispatch();
  const {
    default_interval,
    use_only_last_known_value,
    fit_to_current_indicator_range,
    show_last_known_value_in_range
  } = default_time_mode

  const [nameData, setNameData] = useState(name);
  const [descriptionData, setDescriptionData] = useState(description);
  const [showSplashOnFirstOpenData, setShowSplashOnFirstOpenData] = useState(show_splash_first_open);
  const [groupData, setGroupData] = useState(group);
  const [slugInput, setSlugInput] = useState(slug);
  const [
    truncateIndicatorName,
    setTruncateIndicatorName
  ] = useState(truncate_indicator_layer_name);
  const isCreate = id === null;

  const geoFields = [
    { value: 'concept_uuid', label: 'Concept uuid' },
    { value: 'geometry_code', label: 'Latest ucode' }
  ]

  return (
    <div className='Summary'>
      <div className="BasicForm AdminForm">
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label className="form-label required" htmlFor="name">
                View
              </label>
              <div className='ReferenceDatasetSection'>
                <GeorepoViewSelector
                  initData={
                    referenceLayer?.identifier ? [
                      {
                        id: referenceLayer.identifier,
                        uuid: referenceLayer.identifier, ...referenceLayer
                      }
                    ] : []
                  }
                  dataSelected={(selectedData) => {
                    let selected = { identifier: '', detail_url: '' }
                    if (selectedData[0]) {
                      selected = selectedData[0]
                    }
                    dispatch(Actions.ReferenceLayer.update(selected));
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={6} className='CodeMappingConfig'>
              <label className="form-label required" htmlFor="name">
                Mapping Indicators Using
              </label>
              <SelectWithSearch
                options={geoFields.map(field => field.label)}
                value={geoFields.find(field => geoField === field.value).label}
                onChangeFn={evt => {
                  dispatch(Actions.Dashboard.changeGeoField(geoFields.find(field => evt === field.label).value))
                }}
                disableCloseOnSelect={false}
                fullWidth={true}
                smallHeight={true}
              />
            </Grid>
          </Grid>
        </div>
        <ViewLevelConfiguration
          data={levelConfig}
          setData={
            data => dispatch(Actions.Dashboard.updateProps({
              levelConfig: data
            }))
          }
          referenceLayer={referenceLayer}
        />
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div>
                <label className="form-label required" htmlFor="name">
                  Name
                </label>
              </div>
              <div>
              <span className="form-input">
              <input
                id="SummaryName" type="text" name="name" required={true}
                placeholder='Example: Afghanistan Risk Dashboard'
                value={nameData}
                onChange={(event) => {
                  setNameData(event.target.value)
                  changed(true)
                  if (isCreate) {
                    setSlugInput(slugify(event.target.value))
                  }
                }}/>
              </span>
              </div>
            </Grid>
            <Grid item xs={3}>
              <label className="form-label required" htmlFor="name">
                Category
              </label>
              <div>
              <span className="form-input">
                <Creatable
                  id="SummaryCategory"
                  options={
                    projectCategories.map(cat => {
                      return { value: cat, label: cat }
                    })
                  }
                  value={{ value: groupData, label: groupData }}
                  onChange={evt => {
                    setGroupData(evt.value)
                    changed(true)
                  }}
                  disableCloseOnSelect={false}
                  fullWidth={true}
                  smallHeight={true}
                />
              </span>
              </div>
            </Grid>
            <Grid item xs={3}>
              <label className="form-label" htmlFor="name">
                URL Shortcode
              </label>
              <div>
                <span className="form-input">
                <input
                  id="SummarySlug" type="text" name="name" required={true}
                  value={slugInput}
                  onChange={(event) => {
                    setSlugInput(slugify(event.target.value))
                    changed(true)
                  }}/>
                </span>
              </div>
              <span className='form-helptext'>
                Url of project in slug format. It will auto change space to "-" and to lowercase.
                It will be generated from name if empty.
              </span>
            </Grid>
          </Grid>
        </div>
        {/* DEFAULT TIME MODE */}
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <FormControl>
                    <label
                      className="form-label"
                      htmlFor="name">Default time mode</label>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={'use_only_last_known'}
                          checked={use_only_last_known_value}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  fit_to_current_indicator_range: !use_only_last_known_value ? false : fit_to_current_indicator_range,
                                  show_last_known_value_in_range: !use_only_last_known_value ? true : show_last_known_value_in_range,
                                  use_only_last_known_value: !use_only_last_known_value
                                }
                              })
                            )
                          }}
                        />
                      }
                      label={'Use last know value for all indicators (disables time slider)'}/>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={'fit_to_current_indicator_range'}
                          checked={fit_to_current_indicator_range}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  fit_to_current_indicator_range: !fit_to_current_indicator_range
                                }
                              })
                            )
                          }}
                          disabled={use_only_last_known_value}
                        />
                      }
                      label={'Fit to current indicator range'}/>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={'show_last_known_value_in_range'}
                          checked={show_last_known_value_in_range}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  show_last_known_value_in_range: !show_last_known_value_in_range
                                }
                              })
                            )
                          }}
                          disabled={use_only_last_known_value}
                        />
                      }
                      label={'Show last known value in range'}/>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl>
                    <label className="form-label"
                           htmlFor="name">Default interval</label>
                    <SelectWithList
                      id='default_interval'
                      tabIndex="-1"
                      list={[INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
                      required={true}
                      value={default_interval}
                      classNamePrefix={'ReactSelect'}
                      onChange={evt => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            default_time_mode: {
                              ...default_time_mode,
                              default_interval: evt.value
                            }
                          })
                        )
                      }}
                      isDisabled={use_only_last_known_value}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl className='IconInput'>
                <label className="form-label"
                       htmlFor="name">Description</label>
                <textarea
                  id='SummaryDescription'
                  name="textarea"
                  value={descriptionData}
                  style={{ height: "200px" }}
                  onChange={(evt) => {
                    setDescriptionData(evt.target.value)
                    changed(true)
                  }}/>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className='IconInput'>
                <label className="form-label" htmlFor="name">Icon</label>
                <ImageInput
                  id='SummaryIcon'
                  name="icon"
                  image={icon}
                  onChange={() => {
                    changed(true)
                  }}/>
              </FormControl>
            </Grid>
          </Grid>
        </div>
        <div className="BasicFormSection">
          <FormGroup>
            <FormControlLabel
              control={<Checkbox
                id={'SummarySplash'}
                checked={showSplashOnFirstOpenData}
                onChange={(event) => {
                  setShowSplashOnFirstOpenData((value) => !value)
                  changed(true)
                }}
              />}
              label={'Show as a splash screen when opening project for the first time'}/>
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox
                id={'SummaryTruncateIndicatorName'}
                checked={truncateIndicatorName}
                onChange={(event) => {
                  setTruncateIndicatorName((value) => !value)
                  changed(true)
                }}
              />}
              label={'Truncate long indicator layer name'}/>
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox
                id={'SummaryEnableGeometrySearch'}
                checked={enable_geometry_search}
                onChange={(event) => {
                  dispatch(Actions.Dashboard.updateProps({
                    enable_geometry_search: !enable_geometry_search
                  }))
                  changed(true)
                }}
              />}
              label={'Enable geography entity search box'}/>
          </FormGroup>
        </div>
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Extent
            </label>
          </div>
          <MapConfig/>
        </div>
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Project overview
            </label>
          </div>
          <OverviewForm changed={changed}/>
        </div>
      </div>
    </div>
  )
}
