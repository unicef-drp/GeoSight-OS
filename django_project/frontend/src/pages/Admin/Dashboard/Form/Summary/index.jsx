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
import MDEditor from "@uiw/react-md-editor";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import MapConfig from './MapConfig'
import { Actions } from "../../../../../store/dashboard";
import {
  GeorepoViewInputSelector
} from "../../../ModalSelector/InputSelector";
import { slugify } from "../../../../../utils/main";
import {
  ViewLevelConfiguration
} from "../../../Components/Input/ReferenceLayerLevelConfiguration";

import './style.scss';
import Grid from "@mui/material/Grid";
import {
  SelectWithSearch
} from "../../../../../components/Input/SelectWithSearch";
import { ImageInput } from "../../../../../components/Input/ImageInput";

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
    group,
    referenceLayer,
    geoField,
    levelConfig,
    show_splash_first_open,
    truncate_indicator_layer_name
  } = useSelector(state => state.dashboard.data);
  const dispatch = useDispatch();

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
                Reference Dataset
              </label>
              <div className='ReferenceDatasetSection'>
                <GeorepoViewInputSelector
                  data={referenceLayer?.identifier ? [referenceLayer] : []}
                  setData={selectedData => {
                    dispatch(Actions.ReferenceLayer.update(selectedData[0]));
                    dispatch(Actions.Geometries.deleteAll());
                  }}
                  isMultiple={false}
                  showSelected={false}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
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
                <label className="form-label required"
                       htmlFor="name">Name</label>
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
              <input
                id="SummaryCategory" type="text" name="category"
                placeholder='Example: Lorem Ipsum'
                required={true} value={groupData}
                onChange={(event) => {
                  setGroupData(event.target.value)
                  changed(true)
                }}/>
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
        <div className="BasicFormSection">
          <Grid container spacing={2}>
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
          <div>
            <label className="form-label" htmlFor="name">Description</label>
          </div>
          <div className='DescriptionInput'>
            <div className="container">
              <div data-color-mode="light">
                <MDEditor
                  id='SummaryDescription'
                  height={200} value={descriptionData}
                  onChange={(value) => {
                    setDescriptionData(value)
                    changed(true)
                  }}/>
              </div>
            </div>
          </div>

        </div>
        <div className="BasicFormSection">
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
              label={'Truncate long Indicator Layer name'}/>
          </FormGroup>
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
        </div>
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Extent
            </label>
          </div>
          <MapConfig/>
        </div>
      </div>
    </div>
  )
}
