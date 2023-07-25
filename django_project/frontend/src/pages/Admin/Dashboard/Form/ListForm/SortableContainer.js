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

import React, {Fragment, useEffect, useState} from "react";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable
} from "@dnd-kit/sortable";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DoneIcon from '@mui/icons-material/Done';
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconTextField } from "../../../../../components/Elements/Input";
import SortableItem from "./SortableItem";
import { CSS } from "@dnd-kit/utilities";
import {Button, Checkbox} from "@mui/material";

/**
 * Group container
 * @param {dict} data Actual layer data.
 * @param {int} groupIdx Index of group.
 * @param {list} items Layers data.
 * @param {string} groupName Group name.
 * @param {Function} removeGroup Function of remove group.
 * @param {Function} changeGroupName Function of change group name.
 * @param {Function} removeLayer Function of remove layer.
 * @param {Function} changeLayer Function of change layer.
 * @param {Function} addLayerInGroup Function of addLayerInGroup.
 * @param {Function} editLayerInGroup When edit layer in group
 * @param {Function} otherActionsFunction Other actions
 * @param {boolean} selectable Indicates whether the list is selectable or not, default is false
 * @param {Function} removeItems Remove selected items
 */
export default function SortableContainer(
  {
    data,
    groupIdx,
    items,
    groupName,
    removeGroup,
    changeGroupName,
    removeLayer,
    changeLayer,
    addLayerInGroup,
    editLayerInGroup,
    otherActionsFunction,
    selectable = false,
    removeItems
  }) {

  const noGroup = '_noGroup'
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(groupName);
  const [itemSelected, setItemSelected] = useState([]);
  const [groupSelected, setGroupSelected] = useState(false);

  useEffect(() => {
    if (!data) return
    if (data.length !== itemSelected.length) {
      setItemSelected([])
    }
  }, [data])

  useEffect(() => {
    if (items) {
      const itemIds = items.filter(item => Number.isInteger(item))
      if (itemSelected.length === itemIds.length) {
        setGroupSelected(true)
      } else {
        setGroupSelected(false)
      }
    }
  }, [itemSelected])

  const selectItem = (item) => {
    if (itemSelected.indexOf(item) >= 0) {
      setItemSelected(itemSelected.filter(id => id !== item))
    } else {
      setItemSelected([...itemSelected, ...[item]])
    }
  }

  const selectGroup = () => {
    if (!groupSelected) {
      const itemIds = items.filter(item => Number.isInteger(item))
      setItemSelected([...itemIds])
    } else {
      setItemSelected([])
    }
  }

  const handleRemoveItemsClick = () => {
    removeItems(itemSelected.map(item => data[item]))
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: groupName });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };
  return (
    <Fragment>
      <tbody key={groupName} id={groupName} style={style} ref={setNodeRef}
             className={groupName}>
      <SortableContext
        id={groupName} items={items} strategy={rectSortingStrategy}>

        {
          Object.keys(items).length !== 0 ? items.map(item => {
            const layer = data[item];

            /** ----------------------------------------------------  **/
            /** FOR GROUP HEADER **/
            if (!layer) {
              return (
                <SortableItem
                  key={item} id={item}
                  className={'GroupRow ' + item}>
                  {
                    selectable ?
                    <td width={1}>
                        <Checkbox
                            onClick={selectGroup} style={{ color: 'white' }}
                            checked={groupSelected}/>
                    </td> : null
                  }
                  <td className='DragDropItem-Drag'>
                    {
                      item !== noGroup ?
                        <DragHandleIcon
                          className='MuiButtonLike'
                          {...attributes} {...listeners}/> : ''
                    }
                  </td>
                  <td colSpan={5}>
                    {
                      groupName !== noGroup ?
                        <div className='GroupRowTitle'>
                          {
                            editName ? (
                                <Fragment>
                                  <span>Group : </span>
                                  <IconTextField
                                    iconEnd={
                                      <DoneIcon
                                        className='MuiButtonLike'
                                        onClick={() => {
                                          if (changeGroupName(groupName, name)) {
                                            setEditName(false)
                                          }
                                        }}/>
                                    }
                                    value={name}
                                    onChange={(evt) => {
                                      setName(evt.target.value)
                                    }}
                                  />
                                </Fragment>
                              ) :
                              (
                                <Fragment>
                                  <span>Group :  {name ? name :
                                    <i>No Name</i>}
                                  </span>
                                  <EditIcon
                                    className='MuiButtonLike GroupEditName'
                                    onClick={() => {
                                      setEditName(true)
                                    }}/>
                                </Fragment>
                              )
                          }
                          <div className='Separator'/>
                          { itemSelected.length > 0 ?
                            <span className='ItemSelectedInfo'>{itemSelected.length} selected
                              <Button size={'small'} variant="text" onClick={handleRemoveItemsClick}>
                                <DeleteOutlineIcon fontSize={'small'}/>
                              </Button>
                            </span> : ''
                          }
                          <div className='AddButton MuiButtonLike'
                               onClick={() => {
                                 addLayerInGroup(groupName)
                               }}>
                            <AddCircleIcon/>{"Add To Group"}
                          </div>
                          <div className='AddButton MuiButtonLike'
                               onClick={() => {
                                 removeGroup(name)
                               }}>
                            <RemoveCircleIcon/>{"Remove Group"}
                          </div>
                        </div> : ""
                    }
                  </td>
                </SortableItem>
              )
            }
            /** ----------------------------------------------------  **/
            /** FOR GROUP MEMBERS **/
            return (
              <SortableItem key={item} id={item}>
                { selectable ?
                  <td width={1}>
                      <Checkbox onClick={(e) => selectItem(item)} checked={itemSelected.indexOf(item) >= 0}/>
                  </td> : null }
                <td title={layer.name}>
                  <div className='DragDropItem-Name'>
                    {layer.name}
                    {layer.nameOtherElmt ? layer.nameOtherElmt : ""}
                  </div>
                </td>
                <td title={layer.description}>
                  <div className='DragDropItem-Description'>
                    {layer.description}
                  </div>
                </td>
                {
                  otherActionsFunction ?
                    <td className='OtherActionFunctions'>
                      {
                        otherActionsFunction(layer)
                      }
                    </td> : ''
                }
                <td className='VisibilityAction'>
                  {
                    layer.visible_by_default ?
                      <VisibilityIcon
                        className='MuiButtonLike'
                        onClick={() => {
                          layer.visible_by_default = false;
                          changeLayer(layer);
                        }}/> :
                      <VisibilityOffIcon
                        className='MuiButtonLike VisibilityOff'
                        onClick={() => {
                          layer.visible_by_default = true;
                          changeLayer(layer);
                        }}/>
                  }
                </td>
                {
                  editLayerInGroup ?
                    <td className='RemoveAction'>
                      <EditIcon className='MuiButtonLike' onClick={() => {
                        editLayerInGroup(layer)
                      }}/>
                    </td> : ''
                }
                { !selectable ?
                  <td className='RemoveAction'>
                    <RemoveCircleIcon className='MuiButtonLike'
                                      onClick={() => {
                                        removeLayer(layer)
                                      }}/>
                  </td> : null }
              </SortableItem>
            )
          }) : <SortableItem
            key={-1 * groupIdx} id={-1 * groupIdx}
            isDropArea={true}>
            <td colSpan={6} className='DropArea'>Drop Here</td>
          </SortableItem>
        }
      </SortableContext>
      </tbody>
    </Fragment>
  );
};

