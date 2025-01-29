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

import React, { useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import ColorSelector from "../../../../../components/Input/ColorSelector";
import { IndicatorOtherRule, newRule, NO_DATA_RULE } from "../StyleRules";
import ColorPaletteStyleConfig from "./Palette";

import './style.scss';

export const dynamicClassificationChoices = dynamicClassification.map(type => {
  return {
    value: type[0],
    label: type[1]
  }
})

/*** Style section ***/
export default function DynamicStyleConfig({ data, setData }) {

  // Init data
  useEffect(() => {
    let changed = false
    if (!data.style_config) {
      data.style_config = {}
    }
    data.style_config = Object.assign(
      {},
      {
        dynamic_classification: dynamicClassificationChoices[0].value,
        dynamic_class_num: 7,
        sync_outline: false,
        sync_filter: false,
        outline_color: preferences.style_dynamic_style_outline_color,
        outline_size: preferences.style_dynamic_style_outline_size,
      }, data.style_config
    )
    if (!data.style_config.no_data_rule) {
      data.style_config.no_data_rule = newRule(
        [], true, NO_DATA_RULE, NO_DATA_RULE,
        preferences.style_no_data_fill_color,
        preferences.style_no_data_outline_color,
        preferences.style_no_data_outline_size,
        -1
      )
      changed = true
    }
    if (!data.style_config?.no_data_rule?.outline_size) {
      data.style_config.no_data_rule.outline_size = preferences.style_no_data_outline_size;
      changed = true
    }
    if (changed) {
      setData({ ...data })
    }
  }, [])

  if (!data?.style_config) {
    return
  }
  const sync_outline = data.style_config.sync_outline ? data.style_config.sync_outline : false
  const sync_filter = data.style_config.sync_filter ? data.style_config.sync_filter : false
  return <div className='DynamicStyleConfig'>
    <ColorPaletteStyleConfig
      styleType={data.style_type}
      styleConfig={data.style_config}
      setStyleConfig={(style_config) => setData({
        ...data,
        style_config: style_config
      })}
    />
    <div className="BasicFormSection SyncOutline">
      <FormGroup>
        <FormControlLabel
          control={<Checkbox
            name='sync_outline'
            checked={data.style_config.sync_outline ? data.style_config.sync_outline : false}
            onChange={
              _ => {
                data.style_config.sync_outline = !sync_outline
                setData({ ...data })
              }
            }/>}
          label='Sync fill and Outline Color'
        />
      </FormGroup>
      <div className='RuleTable-Title'>Outline</div>
      <div>
        <ColorSelector
          disabled={data.style_config.sync_outline}
          color={data.style_config.outline_color ? data.style_config.outline_color : preferences.style_dynamic_style_outline_color}
          name={'outline_color'}
          onChange={evt => {
            data.style_config.outline_color = evt.target.value
            setData({ ...data })
          }}
        />
      </div>
      <div className='RuleTable-Title'>Outline Width</div>
      <div>
        <input
          type="number"
          className="outline-size"
          spellCheck="false"
          min={0.1}
          step="0.1"
          value={data.style_config.outline_size ? data.style_config.outline_size : preferences.style_dynamic_style_outline_size}
          onChange={evt => {
            data.style_config.outline_size = evt.target.value
            setData({ ...data })
          }}
        />
      </div>
    </div>
    <div className="BasicFormSection SyncOutline">
      <FormGroup>
        <FormControlLabel
          control={<Checkbox
            name='sync_filter'
            checked={data.style_config.sync_filter ? data.style_config.sync_filter : false}
            onChange={
              _ => {
                data.style_config.sync_filter = !sync_filter
                setData({ ...data })
              }
            }/>}
          label='Apply when filtering'
        />
      </FormGroup>
    </div>
    <div className="BasicFormSection">
      <table className='BasicForm RuleTable'>
        <thead>
        <tr className="RuleTable-Header">
          <th colSpan="2"></th>
          <th valign="top">Name</th>
          <th valign="top">Rule</th>
          <th valign="top">Color</th>
          <th valign="top">Outline Color</th>
          <th valign="top">Outline Width</th>
        </tr>
        </thead>
        <tbody>
        {
          data.style_config.no_data_rule ?
            <IndicatorOtherRule
              rule={data.style_config.no_data_rule ? data.style_config.no_data_rule : {}}
              idx={0}
              nameInput={'dynamic_node_data_rule'}
              onChange={rule => {
                setData({ ...data })
              }}
            /> : null
        }
        </tbody>
      </table>
    </div>
  </div>
}