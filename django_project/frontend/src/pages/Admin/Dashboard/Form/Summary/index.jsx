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

  const imageName = (icon) => {
    return icon ? icon.split('/')[icon.split('/').length - 1] : 'No Image'
  }

  const [nameData, setNameData] = useState(name);
  const [descriptionData, setDescriptionData] = useState(description);
  const [showSplashOnFirstOpenData, setShowSplashOnFirstOpenData] = useState(show_splash_first_open);
  const [groupData, setGroupData] = useState(group);
  const [iconSrc, setIconSrc] = useState(icon);
  const [iconName, setIconName] = useState(imageName(icon));
  const [slugInput, setSlugInput] = useState(slug);
  const [
    truncateIndicatorName,
    setTruncateIndicatorName
  ] = useState(truncate_indicator_layer_name);
  const isCreate = id === null;

  /** Image changed */
  const imageChanged = (event) => {
    const [file] = event.target.files
    if (file) {
      setIconSrc(URL.createObjectURL(file));
      setIconName(file.name);
      changed(true)
    } else {
      setIconSrc(icon);
      setIconName(imageName(icon));
    }
  }

  // Geofield value
  const geoFieldUcode = geoField === 'geometry_code'
  const geoFieldUcodeLabel = geoFieldUcode ? "Mapping indicators using latest ucodes." : "Mapping indicators using concept uuid."

  return (
    <div className='Summary'>
      <div className="BasicForm AdminForm">
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Reference Dataset
            </label>
          </div>
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
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={geoFieldUcode} onChange={
                  _ => dispatch(Actions.Dashboard.changeGeoField())
                }/>}
                label={geoFieldUcodeLabel}/>
            </FormGroup>
          </div>
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
          <div>
            <label className="form-label required" htmlFor="name">Name</label>
          </div>
          <div>
              <span className="form-input">
              <input id="SummaryName" type="text" name="name" required={true}
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
        </div>
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              URL Shortcode
            </label>
          </div>
          <div>
              <span className="form-input">
              <input id="SummarySlug" type="text" name="name" required={true}
                     value={slugInput}
                     onChange={(event) => {
                       setSlugInput(slugify(event.target.value))
                       changed(true)
                     }}/>
              </span>
          </div>
          <span className='form-helptext'>
            Url for the project in slug format. It will auto change space to "-" and to lowercase.
            If empty, it will be generated from name.
          </span>
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
        </div>
        <FormControl className='IconInput'>
          <label
            className="MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-outlined MuiFormLabel-root MuiFormLabel-colorPrimary MuiFormLabel-filled css-1sumxir-MuiFormLabel-root-MuiInputLabel-root"
            data-shrink="true">Icon</label>
          <div className='IconInputPreview'>
            <div
              className="MuiInput-root MuiInput-underline MuiInputBase-root MuiInputBase-colorPrimary MuiInputBase-formControl css-1ptx2yq-MuiInputBase-root-MuiInput-root">
              {iconName}
              <input id="SummaryIcon" type="file" name="icon"
                     accept="image/png, image/jpeg"
                     onChange={imageChanged}/>
            </div>
            {iconSrc ? <img src={iconSrc}/> : ''}
          </div>
        </FormControl>
        <div className="BasicFormSection">
          <div>
            <label className="form-label" htmlFor="name">
              Category
            </label>
          </div>
          <div>
              <span className="form-input">
              <input id="SummaryCategory" type="text" name="category"
                     required={true} value={groupData}
                     onChange={(event) => {
                       setGroupData(event.target.value)
                       changed(true)
                     }}/>
              </span>
          </div>
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
