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

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import TreeItem from "@mui/lab/TreeItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, IconButton, Paper } from "@mui/material";
import TreeView from "@mui/lab/TreeView";
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";
import {
  findAllGroups,
  flattenTree,
  getDepth
} from "../SortableTreeForm/utilities";

import {
  indicatorFetchingIds
} from "../../pages/Dashboard/LeftPanel/Indicators";
import LayerDescription from "./Description";
import Highlighted from "./Highlighted";
import { MagnifyIcon } from "../Icons";

import './style.scss';


const TREE_INDENT_SPACE = 40

/**
 * SidePanelTreeView component
 * @param {array} data tree data, format = [{
 *   'id': 'group_id',
 *   'children': [{
 *     'id': 'data_id',
 *     'children': []
 *   }]
 * }]
 * @param {boolean} selectable whether this sidepanel is selectable or not
 * @param {number} maxSelect max selected item
 * @param {boolean} groupSelectable is group also selectable
 * @param {function} onChange callback function to call when selected data changed
 * @param {function} otherInfo Other info that will be rendered before info icon
 */
export default function SidePanelTreeView(
  {
    data,
    selectable = false,
    maxSelect = 0,
    groupSelectable = false,
    onChange = null,
    otherInfo = null,
    ...props
  }) {
  const [nodes, setNodes] = useState([])
  const [selected, setSelected] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [groups, setGroups] = useState([])
  const [filterText, setFilterText] = useState('')
  const layerGroupListRef = useRef(null);
  const [width, setWidth] = useState(25)

  useEffect(() => {
    setNodes(data)
    setGroups(getGroups(data));
    const selected = [];
    for (const item of flattenTree(data)) {
      if (!item.isGroup && item.data?.visible_by_default) {
        selected.push(item.data?.id + '');
      }
    }
    if (selected.length > 0) {
      setSelected([...selected])
    }
  }, [data])

  useLayoutEffect(() => {
    if (layerGroupListRef?.current) {
      setWidth(layerGroupListRef.current.offsetWidth - 20);
    }
  }, []);

  useEffect(() => {
    const filterResults = filterData(JSON.parse(JSON.stringify(data)), filterText)
    setNodes(filterResults)
  }, [filterText])

  useEffect(() => {
    if (selected.length > maxSelect) {
      if (maxSelect === 1) {
        setSelected([selected[0]])
      } else {
        setSelected([...selected.slice(-(maxSelect - 1))])
      }
    }
  }, [maxSelect])

  const getGroups = (groupData) => {
    const _groups = [];
    for (const _data of groupData) {
      if (_data.children.length > 0) {
        _groups.push(...getGroups(_data.children))
      }
      if (_data.isGroup) {
        if (_groups.indexOf(_data.id) === -1) {
          _groups.push(_data.id)
        }
      }
    }
    return _groups;
  }

  const selectItem = (e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    const nodeId = e.target.value;
    let _selectedIds = []
    if (selected.indexOf(nodeId) >= 0) {
      _selectedIds = [...selected.filter(s => s !== nodeId)]
    } else {
      if (maxSelect === 1) {
        _selectedIds = [nodeId]
      } else if (maxSelect === 0) {
        _selectedIds = [...selected, nodeId]
      } else {
        _selectedIds = [...selected.slice(0, (maxSelect - 1)), nodeId]
      }
    }
    if (!checked && selectedGroups.length > 0) {
      const layers = flattenTree(data);
      for (const layer of layers) {
        if (!layer.isGroup && layer.data) {
          if ('' + layer.data.id === nodeId) {
            const group = layer.data.group;
            setSelectedGroups([...selectedGroups.filter(id => id !== group)])
          }
        }
      }
    }
    onChange(_selectedIds)
    setSelected(_selectedIds)
  }

  const getChildIds = (_data) => {
    const _selectedIds = []
    for (const item of _data.children) {
      if (!item.data || item.isGroup) {
        if (item.children) {
          _selectedIds.push(...getChildIds(item))
        }
        continue
      }
      if (!item.data.error) {
        _selectedIds.push('' + item.data.id)
      }
    }
    return _selectedIds;
  }

  const selectGroup = (e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    let _selectedIds = [];
    let _selectedGroups = [e.target.value]
    const allGroups = findAllGroups(data);
    let parentGroup = e.target.value;
    for (const _data of allGroups) {
      if (_data.isGroup && _data.id === e.target.value) {
        _selectedIds.push(...getChildIds(_data))
      }
      if (_data.parentId === parentGroup) {
        _selectedGroups.push(_data.id)
        parentGroup = _data.id;
      }
    }
    if (checked) {
      _selectedIds = ([...selected, ..._selectedIds.filter(id => selected.indexOf(id) >= -1)]);
      _selectedGroups = ([...selectedGroups, ..._selectedGroups.filter(id => selectedGroups.indexOf(id) >= -1)])
    } else {
      _selectedIds = ([...selected.filter(id => _selectedIds.indexOf(id) === -1)])
      _selectedGroups = ([...selectedGroups.filter(id => _selectedGroups.indexOf(id) === -1)])
    }
    setSelectedGroups([..._selectedGroups])
    onChange(_selectedIds)
    setSelected(_selectedIds)
  }

  const handleToggle = (event, nodeIds) => {
    setGroups(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    event.stopPropagation();
  };

  function filterData(data, query) {
    try {
      return data.filter(node => {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (node.children.length > 0) {
          node.children = filterData(node.children, query)
          return node.children.length > 0;
        }
      });
    } catch (e) {
      return false
    }
  }

  const onFilterChange = (e) => {
    setFilterText(e.target.value)
  }

  const renderTree = (treeData) => {
    const nodesDataId = treeData.data ? '' + treeData.data.id : treeData.id;
    let loading = treeData?.data?.loading;
    const disabled = treeData.data ? treeData.data.disabled ? true: !!treeData.data.error : false;
    const itemDeep = getDepth(data, treeData.id)
    const maxWord = parseInt(
      '' + ((width - (TREE_INDENT_SPACE * itemDeep)) / 9)
    )
    let id = ''
    if (treeData?.data && !treeData?.data?.layer_type) {
      id = 'Indicator-Radio-' + treeData?.data?.id
      if (indicatorFetchingIds.includes(treeData?.data?.id)) {
        loading = true
      }
    }
    if (!treeData.name) {
      return
    }
    const checked = selected.indexOf(nodesDataId) >= 0
    return <TreeItem
      className={'TreeItem' + (disabled ? ' Disabled' : '') + (checked ? ' Mui-selected' : '')}
      disabled={disabled}
      key={nodesDataId}
      nodeId={nodesDataId}
      label={
        !treeData.isGroup && selectable ?
          <div>
            <FormControlLabel
              control={
                <div id={id}
                     className={'PanelInput ' + (loading ? 'Loading' : '')}>
                  {
                    maxSelect > 1 ?
                      <Checkbox
                        tabIndex="-1"
                        className='PanelCheckbox'
                        size={'small'}
                        disabled={disabled}
                        value={nodesDataId}
                        checked={checked}
                        onChange={selectItem}/> :
                      <Radio
                        tabIndex="-1"
                        className='PanelRadio'
                        size={'small'}
                        disabled={disabled}
                        value={nodesDataId}
                        checked={checked}
                        onChange={selectItem}/>
                  }
                  <CircularProgress/>
                </div>
              }
              label={
                <span>
                  <Highlighted
                    text={treeData.name.replace(new RegExp(`(\\w{${maxWord}})(?=\\w)`), '$1 ')}
                    highlight={filterText}/>
                  {
                    otherInfo ? otherInfo(treeData) : null
                  }
                  <LayerDescription layer={treeData?.data}/>
                </span>
              }
            />
            {treeData.data?.legend && selected.indexOf(nodesDataId) >= 0 ?
              <div
                dangerouslySetInnerHTML={{ __html: treeData.data?.legend }}></div> : ''}
          </div> : groupSelectable ?
            <FormControlLabel
              className='GroupSelectable Group'
              onClick={(e) => e.stopPropagation()}
              control={
                <Checkbox
                  checked={selectedGroups.length > 0 && selectedGroups.indexOf(treeData.id) >= 0}
                  onClick={(e) => e.stopPropagation()}
                  onChange={selectGroup} className='PanelCheckbox' size={'small'}
                  value={treeData.id}/>}
              label={
                <Highlighted
                  isGroup={true}
                  text={treeData.name ? treeData.name : 'No Name'}
                  highlight={filterText}/>}
            /> :
            <Highlighted
              isGroup={true}
              text={treeData.name ? treeData.name : 'No Name'}
              highlight={filterText}/>
      }>
      {Array.isArray(treeData.children)
        ? treeData.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  };

  return (
    <div className='TreeView'>
      <Paper component="form"
             sx={{
               p: '2px 4px',
               display: 'flex',
               alignItems: 'center', width: '100%'
             }}
      >
        <TextField
          className='PanelSearchBox'
          variant={'outlined'}
          value={filterText}
          onKeyPress={(e) => {
            e.key === 'Enter' && e.preventDefault();
          }}
          placeholder={props.placeholder ? props.placeholder : ''}
          onChange={onFilterChange}
          InputProps={{
            endAdornment: (
              <IconButton type="button" sx={{ p: '10px' }}
                          aria-label="search"
                          disabled={filterText.length === 0}
                          onClick={() => setFilterText('')}>
                {filterText ? <ClearIcon/> : <MagnifyIcon/>}
              </IconButton>
            )
          }}/>
      </Paper>
      <TreeView
        aria-label="rich object"
        ref={layerGroupListRef}
        defaultCollapseIcon={<ExpandMoreIcon/>}
        expanded={groups}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        defaultExpandIcon={<ExpandLessIcon/>}
        sx={{ flexGrow: 1, maxWidth: '100%', paddingRight: '1em' }}
      >
        {nodes.length > 0 ? nodes.map(treeData => renderTree(treeData)) : 'No data'}
      </TreeView>
    </div>
  );
}
