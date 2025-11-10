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

import React from 'react';
import ColorSelector from '../../../../../components/Input/ColorSelector';

/**
 * One point input
 */
export default function PolygonInput({ style, update }) {

  return <div className='ContextLayerConfigInput BasicForm'>
    <div className="BasicFormSectionInline">
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
    </div>
    <div className="BasicFormSectionInline">
      <div className="BasicFormSection">
        <div>
          <label className="form-label">Fill Color</label>
        </div>
        <div>
          <ColorSelector
            color={style.style.fillColor}
            onChange={evt => {
              style.style.fillColor = evt.target.value
              style.style.fillOpacity = 1
              update()
            }}
            hideInput={true}
            fullWidth={true}
          />
        </div>
      </div>
    </div>
  </div>
}