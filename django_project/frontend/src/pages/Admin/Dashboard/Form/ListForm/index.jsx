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
import { v4 as uuidv4 } from 'uuid';
import AddIcon from "@mui/icons-material/Add";
import {
  AddButton,
  ThemeButton
} from "../../../../../components/Elements/Button";
import { deleteUrlCache, fetchingData } from "../../../../../Requests";

import DataSelectionModal from './DataSelectionModal'

import { SortableTree } from "../../../../../components/SortableTreeForm/index"
import {
  dataStructureToTreeData,
  findAllGroups,
  updateGroupInStructure
} from "../../../../../components/SortableTreeForm/utilities";
import { dictDeepCopy } from "../../../../../utils/main";
import { BaseList } from "../../../Components/List";
import { formWindow } from "../../../../../utils/windows";

import './style.scss';
import CircularProgress from "@mui/material/CircularProgress";

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
    ...props
  }
) {
  // GLOBAL DATA
  const className = pageName.replaceAll(' ', '')
  const singularPageName = pageName.substring(0, pageName.length - 1);

  // Generate group of layers
  const [listData, setListData] = useState(null);
  const [currentGroupName, setCurrentGroupName] = useState(null);
  const [open, setOpen] = useState(false);
  const [applyingCreateNew, setApplyingCreateNew] = useState(false);

  const [treeData, setTreeData] = useState(null)

  // Fetch data
  useEffect(() => {
    if (listUrl) {
      if (open) {
        setListData([])
        fetchingData(listUrl, {}, {}, (data) => {
          setListData(data)
        })
      }
    } else if (defaultListData) {
      setListData(defaultListData)
    }
  }, [defaultListData, open])

  // add uuid to the data structure
  const updateUuid = (currDataStructure) => {
    if (Object.keys(currDataStructure).includes('group')) {
      if (!currDataStructure.id) {
        currDataStructure.id = uuidv4() + '';
      }
      currDataStructure.children?.forEach(child => {
        updateUuid(child)
      })
    }
  }
  // Onload, check the default one
  useEffect(() => {
    const oldDataStructure = JSON.stringify(dataStructure)
    if (!dataStructure.children?.length && data.length) {
      dataStructure.children = data.map(row => row.id)
    }
    updateUuid(dataStructure)
    if (oldDataStructure !== JSON.stringify(dataStructure)) {
      setDataStructure({ ...dataStructure })
    }
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
        dataStructure.children.unshift({
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
    if (layer) {
      removeLayerAction(layer)
    }
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
  const applyData = (addedData, removeData, groupName) => {
    let usedGroupName = currentGroupName
    if (groupName) {
      usedGroupName = groupName
    }

    addedData.map(data => {
      data.group = usedGroupName
      addLayerAction(data)
    })
    removeData.map(data => {
      removeLayerAction(data, usedGroupName)
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
              {props.otherHeaders}
              {(props.createNew && urls.api[pageName.toLowerCase()]?.create && urls.api[pageName.toLowerCase()]?.detail) ?
                <ThemeButton
                  variant="primary"
                  disabled={applyingCreateNew}
                  onClick={() => {
                    formWindow(urls.api[pageName.toLowerCase()]?.create).then(response => {
                      setApplyingCreateNew(true)
                      fetchingData(
                        urls.api[pageName.toLowerCase()]?.detail.replace('0', response), {}, {},
                        (data) => {
                          deleteUrlCache(listUrl)
                          applyData([data], [], dataStructure.id)
                          setApplyingCreateNew(false)
                        }
                      )
                    })
                  }}
                >
                  {
                    applyingCreateNew ? <CircularProgress/> :
                      <AddIcon/>
                  }
                  {
                    "Create New " + singularPageName
                  }
                </ThemeButton> : null

              }
              <AddButton
                variant="primary" text={"Add " + singularPageName}
                onClick={() => addLayerInGroup(dataStructure.id)}
              />
              {
                hasGroup ?
                  <AddButton
                    className='AddGroupButton'
                    variant="primary" text={"Add Group"}
                    onClick={addGroup}/> : ""
              }
            </div>
          </div>
          {
            props.listConfig ?
              <BaseList
                pageName={pageName}
                {...props.listConfig}
              /> :
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
          }

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