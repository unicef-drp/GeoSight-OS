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

import React, { Fragment, useEffect, useState } from 'react';

import { AddButton } from "../../../../../components/Elements/Button";
import { fetchingData } from "../../../../../Requests";

import DataSelectionModal from './DataSelectionModal'

import { SortableTree } from "../../../../../components/SortableTreeForm/index"
import {
  dataStructureToTreeData,
  findAllGroups,
  updateGroupInStructure
} from "../../../../../components/SortableTreeForm/utilities";
import { dictDeepCopy } from "../../../../../utils/main";

import './style.scss';

const groupDefault = {
  'group': '',
  'children': []
}
/**
 * Basemaps dashboard
 * @param {string} pageName Page Name.
 * @param {Array} data Current data.
 * @param {Dict} dataStructure Structure data.
 * @param {Function} setDataStructure Set structure data.
 * @param {string} listUrl API for list data.
 * @param {Array} defaultListData Default list data.
 * @param {Function} addLayerAction Action of Layer Added.
 * @param {Function} removeLayerAction Action of Layer Removed.
 * @param {Function} changeLayerAction Action of Layer Changed.
 * @param {Function} addLayerInGroupAction When Add Layer In Group.
 * @param {Function} editLayerInGroupAction When edit layer in group
 * @param {Function} otherActionsFunction Other actions
 *
 * @param {boolean} openDataSelection Open data selection
 * @param {Function} setOpenDataSelection Set open data selection
 * @param {boolean} hasGroup Is the data has group
 * @param {Array} initColumns Column initiation.
 */
export default function ListForm(
  {
    pageName,
    data,
    dataStructure,
    setDataStructure,
    listUrl,
    defaultListData,

    // Layer actions
    addLayerAction,
    removeLayerAction,
    changeLayerAction,
    addLayerInGroupAction,
    editLayerInGroupAction,
    otherActionsFunction,

    openDataSelection,
    setOpenDataSelection,
    hasGroup = true,
    initColumns = null,
  }
) {
  // GLOBAL DATA
  const className = pageName.replaceAll(' ', '')
  const singularPageName = pageName.substring(0, pageName.length - 1);

  // Generate group of layers
  const [listData, setListData] = useState(null);
  const [currentGroupName, setCurrentGroupName] = useState(null);
  const [open, setOpen] = useState(false);

  const [treeData, setTreeData] = useState(null)

  // Fetch data
  useEffect(() => {
    if (listUrl) {
      fetchingData(listUrl, {}, {}, (data) => {
        setListData(data)
      })
    } else if (defaultListData) {
      setListData(defaultListData)
    }
  }, [defaultListData])

  // Onload, check the default one
  useEffect(() => {
    setTreeData(dataStructureToTreeData(data, dataStructure))
  }, [data, dataStructure])

  // Open data selection when the props true
  useEffect(() => {
    if (openDataSelection) {
      setOpen(true)
    }
  }, [openDataSelection])

  // Open data selection when the props true
  useEffect(() => {
    if (setOpenDataSelection) {
      setOpenDataSelection(open)
    }
  }, [open])

  /** Add group */
  const addGroup = () => {
    let created = false;
    let allGroups = findAllGroups(treeData);
    let idx = allGroups.length + 1;
    let maxTry = 10 + idx;
    let groupName = '';
    while (!created && idx < maxTry) {
      groupName = 'Group ' + idx;
      const group = allGroups.find(group => group.name === groupName)
      if (!group) {
        dataStructure.children.push({
          ...dictDeepCopy(groupDefault),
          group: groupName
        })
        setDataStructure({ ...dataStructure })
        created = true
      }
      idx += 1;
    }
  }

  /*** Remove layers in group **/
  const removeLayersInGroup = (group) => {
    group.children.map(child => {
      if (!child.group) {
        const layerData = data.find(row => row.id === child)
        removeLayer(layerData)
      } else {
        removeLayersInGroup(child)
      }
    })
  }

  /** Remove group */
  const removeGroup = (groupName) => {
    updateGroupInStructure(groupName, dataStructure, (data, structure) => {
      const index = structure.children.indexOf(data);
      if (index > -1) {
        structure.children.splice(index, 1)
        setDataStructure({ ...dataStructure })
        removeLayersInGroup(data)
      }
    })
  }

  /** Remove Layer */
  const removeLayer = (layer) => {
    removeLayerAction(layer)
  }
  /** Change Layer */
  const changeLayer = (layer) => {
    changeLayerAction(layer)
  }
  /** Change group name */
  const changeGroupName = (id, newName) => {
    updateGroupInStructure(id, dataStructure, data => {
      data.group = newName
      setDataStructure({ ...dataStructure })
    })
  }

  const addLayerInGroup = (groupName) => {
    setCurrentGroupName(groupName)
    if (addLayerInGroupAction) {
      addLayerInGroupAction(groupName)
    } else {
      setOpen(true)
    }
  }
  /** APPLY DATA WHEN REMOVED OR DELETED **/
  const applyData = (addedData, removeData) => {
    addedData.map(data => {
      data.group = currentGroupName
      addLayerAction(data)
    })
    removeData.map(data => {
      removeLayerAction(data, currentGroupName)
    })
    setDataStructure({ ...dataStructure })
    setOpen(false)
  }

  return <Fragment>
    {
      !treeData ? <div>Loading</div> :
        <div className={'TableForm ' + className}>
          <div className='TableForm-Header'>
            <div className='TableForm-Header-Left'></div>
            <div className='TableForm-Header-Right'>
              <AddButton
                variant="secondary" text={"Add " + singularPageName}
                onClick={() => addLayerInGroup("")}/>
              {
                hasGroup ?
                  <AddButton
                    className='AddGroupButton'
                    variant="secondary" text={"Add Group"}
                    onClick={addGroup}/> : ""
              }
            </div>
          </div>

          <SortableTree
            data={treeData}
            changeGroupName={changeGroupName}
            changeLayer={changeLayer}
            otherActionsFunction={otherActionsFunction}
            rearrangeLayers={structure => {
              setDataStructure({ ...structure })
            }}
            addLayerInGroup={addLayerInGroup}
            removeGroup={removeGroup}
            removeLayer={removeLayer}
            editLayerInGroupAction={editLayerInGroupAction}
            isIndicator={pageName === 'Indicators'}
            collapsible indicator/>

          {
            open ?
              <DataSelectionModal
                listData={listData}
                selectedData={data}
                open={open} setOpen={setOpen}
                pageName={pageName}
                groupName={currentGroupName}
                applyData={applyData}
                initColumns={initColumns}
              />
              : ""
          }
        </div>
    }
  </Fragment>
}