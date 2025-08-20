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
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftIcon
  from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';

import { ThemeButton } from "../../../../../components/Elements/Button";
import MultiSelectorConfigRows from "./Row";

import './styles.scss';

/**
 * Multi selector with label and color config
 * @param {Array} items Item that will be used.
 * @param {Array} selectedItems Selected items that will be used.
 * @param {Function} setSelectedItems Selected items changed.
 * @param {Boolean} configEnabled If config enabled.
 * @param {dict} props Other props
 */
export default function MultiSelectorConfig(
  { items, selectedItems, setSelectedItems, configEnabled = true, ...props }
) {
  const [temporarySelectedItems, setTemporarySelectedItems] = useState([]);
  const [filter, setFilter] = useState('');
  const ids = selectedItems.map(item => item.id)
  let itemList = []
  if (items) {
    itemList = items.filter(item => !ids.includes(item.id));
  }

  /** Default row data **/
  const defaultRowData = (item) => {
    return {
      id: item.id,
      name: item.name,
      color: '#000000'
    }
  }
  let filteredItems = itemList
  if (filter) {
    filteredItems = itemList.filter(item => item.name.includes(filter))
  }

  return (
    <div
      className={'MultiSelectorItem ' + (props.className ? props.className : '')}>
      <div className='MultiSelectorItemList'>
        <input
          type="text"
          placeholder="Filter data"
          onChange={(event) => {
            setFilter(event.target.value)
          }}
          value={filter}
        />
        <Select
          multiple
          native
          label="Native"
          value={temporarySelectedItems}
          onChange={(evt) => {
            const { options } = event.target;
            const values = [];
            for (let i = 0, l = options.length; i < l; i += 1) {
              if (options[i].selected) {
                if (isNaN(options[i].value)) {
                  values.push(options[i].value);
                } else {
                  values.push(parseInt(options[i].value));
                }
              }
            }
            setTemporarySelectedItems(values)
          }}
        >
          {
            filteredItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))
          }
        </Select>
        {
          !items?.length ? <CircularProgress/> : null
        }
      </div>

      {/* Add buttons for multi selector */}
      <div className='MultiSelectorButtons'>
        <div>
          <ThemeButton
            variant="primary Basic"
            onClick={() => {
              let newItems = []
              if (items) {
                newItems = items.filter(item => temporarySelectedItems.includes(item.id)).map(item => defaultRowData(item))
              }
              setSelectedItems(
                [
                  ...selectedItems,
                  ...newItems
                ]
              )
              setTemporarySelectedItems([])
            }}>
            <KeyboardArrowRightIcon/>
          </ThemeButton>
        </div>
        <div>
          <ThemeButton
            variant="primary Basic"
            onClick={() => {
              setSelectedItems([])
              setTemporarySelectedItems([])
            }}>
            <KeyboardDoubleArrowLeftIcon/>
          </ThemeButton>
        </div>
      </div>
      <div className='ItemRows'>
        <MultiSelectorConfigRows
          selectedItems={selectedItems} setSelectedItems={setSelectedItems}
          configEnabled={configEnabled}
          additionalFields={props.additionalFields ? props.additionalFields : []}
          {...props}
        />
      </div>
    </div>
  )
}