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
 * __date__ = '27/12/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { FormControlLabel, IconButton } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import CustomPopover from "../../CustomPopover";

import './style.scss';

/***
 * Tree item child
 */
function TreeItemChildren({ id, label, group, onSelected, deep = 1 }) {
  const keys = Object.keys(group)
  keys.sort()
  return <>
    {
      keys.map(key => {
        const _id = id + '-' + key;
        if (!key.includes('_')) {
          return <TreeItemGroup
            key={_id}
            id={_id}
            label={(
              deep === 1 ? key : deep === 4 ? label + ' ' + key : deep > 4 ? label + ':' + key : label + '-' + key
            )}
            group={group[key]}
            onSelected={onSelected}
            deep={deep}
          />
        }
        return null
      })
    }
  </>
}

/***
 * Tree item group
 */
function TreeItemGroup({ id, label, group, onSelected, deep }) {
  return <TreeItem
    className={'Deep-' + deep}
    nodeId={id}
    label={
      <FormControlLabel
        onClick={(evt) => {
          evt.stopPropagation();
        }}
        onChange={(evt) => {
          evt.stopPropagation();
          onSelected(group._options, evt.target.checked)
        }}
        control={
          <Checkbox
            size='small'
            checked={group._selected}
            onClick={(evt) => {
              evt.stopPropagation();
            }}/>
        }
        label={label}
      />
    }>
    <TreeItemChildren
      id={id}
      label={label} group={group}
      onSelected={onSelected} deep={deep + 1}
    />
  </TreeItem>
}

/**
 * Quick selection for options
 */
export default function SelectWithSearchQuickSelection(
  { value, options, onChange }
) {
  const groups = {}
  let allSelected = true
  options.map(option => {
    let currGroups = groups
    let isSelected = value.includes(option)
    try {
      option.split(/[.\\+]/)[0].split(/[T:\\-]/).map(group => {
        if (!currGroups[group]) {
          currGroups[group] = {
            _options: [],
            _selected: true
          }
        }
        if (!isSelected) {
          currGroups[group]._selected = false
          allSelected = false
        }
        currGroups[group]._options.push(option)
        currGroups = currGroups[group]
      })
    } catch (err) {

    }
  })

  return <CustomPopover
    anchorOrigin={{
      vertical: 'center',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'center',
      horizontal: 'left',
    }}
    Button={
      <IconButton size={"small"}>
        <AccountTreeIcon/>
      </IconButton>
    }
  >
    <TreeView
      className='QuickSelection'
      defaultCollapseIcon={<ExpandMoreIcon/>}
      defaultExpandIcon={<ChevronRightIcon/>}
    >
      <TreeItemGroup
        id={'all'}
        label={'Select all'}
        group={{
          _options: options,
          _selected: allSelected
        }}
        onSelected={(_, checked) => {
          if (checked) {
            onChange(options)
          } else {
            onChange([])
          }
        }}
        deep={1}
      />
      <TreeItemChildren
        id={''}
        label={''}
        group={groups}
        onSelected={(options, checked) => {
          if (checked) {
            onChange(
              Array.from(new Set(value.concat(options)))
            )
          } else {
            onChange(value.filter(val => !options.includes(val)))
          }
        }}/>
    </TreeView>
  </CustomPopover>
}