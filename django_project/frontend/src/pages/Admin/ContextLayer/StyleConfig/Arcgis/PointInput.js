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

import React, { Fragment } from 'react';
import ColorSelector from "../../../../../components/Input/ColorSelector";
import { Select } from "../../../../../components/Input";

/**
 * One point input
 */
export default function PointInput({ style, update }) {
  const optionsTypes = [
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
    { value: 'icon', label: 'Icon' },
  ]
  const type = optionsTypes.find(opt => opt.value === style.type)

  return <div className='ContextLayerConfigInput BasicForm'>
    <div className="BasicFormSection">
      <div>
        <label className="form-label">Type</label>
      </div>
      <div>
        <Select
          options={optionsTypes} defaultValue={type}
          onChange={(evt) => {
            style.type = evt.value
            update()
          }}/>
      </div>
    </div>
    {
      style.type !== 'icon' ?
        <Fragment>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Radius</label>
            </div>
            <div>
              <input
                type="number" spellCheck="false"
                step={0.1}
                defaultValue={style.style.radius}
                onChange={evt => {
                  style.style.radius = evt.target.value
                  update()
                }}
              />
            </div>
          </div>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Border Color</label>
            </div>
            <div>
              <ColorSelector
                color={style.style.color}
                onChange={evt => {
                  style.style.color = evt.target.value
                  update()
                }}
                hideInput={true}
                fullWidth={true}
              />
            </div>
          </div>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Border Weight</label>
            </div>
            <div>
              <input
                type="number" spellCheck="false"
                defaultValue={style.style.weight}
                step={0.1}
                onChange={evt => {
                  style.style.weight = evt.target.value
                  update()
                }}/>
            </div>
          </div>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Fill Color</label>
            </div>
            <div>
              <ColorSelector
                color={style.style.fillColor}
                onChange={evt => {
                  style.style.fillColor = evt.target.value
                  update()
                }}
                hideInput={true}
                fullWidth={true}
              />
            </div>
          </div>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Fill Color Opacity</label>
            </div>
            <div>
              <input
                type="number" spellCheck="false"
                value={style.style.fillOpacity}
                step={0.1}
                max={1}
                onChange={evt => {
                  style.style.fillOpacity = evt.target.value
                  update()
                }}/>
            </div>
          </div>
        </Fragment> : <Fragment>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Icon</label>
            </div>
            <div>
              <img src={style.style.iconUrl}/>
              <input
                type="file" spellCheck="false"
                accept="image/png, image/gif, image/jpeg"
                onChange={evt => {
                  const file = evt.target.files[0]
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    style.style.iconUrl = reader.result
                    update()
                  };
                }}
              />
            </div>
          </div>
          <div className="BasicFormSection">
            <div>
              <label className="form-label">Size</label>
            </div>
            <div className='ContextLayerConfig-IconSize'>
              <input
                type="number" spellCheck="false"
                value={style.style.iconSize ? style.style.iconSize[0] : 0}
                step={0.1}
                onChange={evt => {
                  if (!style.style.iconSize) {
                    style.style.iconSize = []
                  }
                  style.style.iconSize[0] = evt.target.value
                  update()
                }}/>
              <div className='ContextLayerConfig-IconSize-X'>X</div>
              <input
                type="number" spellCheck="false"
                value={style.style.iconSize ? style.style.iconSize[1] : 0}
                step={0.1}
                onChange={evt => {
                  if (!style.style.iconSize) {
                    style.style.iconSize = []
                  }
                  style.style.iconSize[1] = evt.target.value
                  update()
                }}/>
            </div>
          </div>
        </Fragment>
    }
  </div>
}