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

import React, { useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";
import {
  arrayMove,
  insertAtIndex,
  removeAtIndex
} from "../../../../../utils/Array";

import SortableContainer from "./SortableContainer";

/**
 * List that can be sortable
 * @param {dict} groups Groups data.
 * @param {Function} removeGroup Function of remove group.
 * @param {Function} changeGroupName Function of change group name.
 * @param {Function} removeLayer Function of remove layer.
 * @param {Function} changeLayer Function of change layer.
 * @param {Function} addLayerInGroup Function of addLayerInGroup.
 * @param {Function} editLayerInGroup When edit layer in group
 * @param {Function} rearrangeLayers Rearrange layers
 * @param {Function} otherActionsFunction Other actions
 * @param {boolean} selectable Indicates if table is selectable
 * @param {Function} removeItems Remove selected items
 */
export default function SortableList(
  {
    groups,
    removeGroup,
    changeGroupName,
    removeLayer,
    changeLayer,
    addLayerInGroup,
    editLayerInGroup,
    rearrangeLayers,
    otherActionsFunction,
    selectable,
    removeItems
  }
) {
  const prevState = useRef();
  const tableName = '_Table'
  const noGroup = '_noGroup'

  // parsing data from groups
  const getData = (groups) => {
    const itemData = {}
    let dictData = {}
    if (groups) {
      for (const [groupName, group] of Object.entries(groups)) {
        const groupNameIdx = (groupName ? groupName : noGroup)
        itemData[groupNameIdx] = [groupNameIdx + '-header'].concat(
          group.filter(layer => {
            return layer.id
          }).map(layer => {
            dictData[layer.id] = layer
            return layer.id
          })
        )
      }
    }
    return {
      itemData: itemData,
      dictData: dictData
    }
  }

  const { itemData, dictData } = getData(groups)
  const [dragMode, setDragMode] = useState(false)
  const [dragged, setDragged] = useState(false)
  const [items, setItems] = useState(itemData)
  const [data, setData] = useState(dictData)
  const [groupsOrder, setGroupsOrder] = useState(Object.keys(items))

  /** Groups changed **/
  useEffect(() => {
    const { itemData, dictData } = getData(groups)
    setItems(itemData)
    setGroupsOrder(Object.keys(itemData))
    setData(dictData)
  }, [groups])

  /** Items changed **/
  useEffect(() => {
    if (!dragged && dragMode) {
      // We save it
      const newItems = {}
      groupsOrder.map(groupName => {
        newItems[(groupName === noGroup) ? "" : groupName] = items[groupName]
      })
      setDragMode(false)
      if (prevState.items !== JSON.stringify(newItems)) {
        rearrangeLayers(newItems)
        prevState.items = JSON.stringify(newItems)
      }
    }
  }, [items, dragged, dragMode, groupsOrder])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  /** When drag event is running **/
  const handleDragOver = ({ over, active }) => {
    const overId = over?.id;

    if (!overId) {
      return;
    }

    let activeContainer = active.data.current.sortable.containerId;
    if (activeContainer === tableName) {
      return;
    }
    if (activeContainer)
      if (!items[activeContainer]) {
        activeContainer = ""
      }
    let overContainer = over.data.current?.sortable.containerId;
    if (!items[overContainer]) {
      overContainer = ""
    }

    const activeIndex = active.data.current.sortable.index;
    const overIndex = over.data.current?.sortable.index || 0;
    if (activeContainer !== overContainer) {
      setItems((items) => {
        return moveBetweenContainers(
          items,
          activeContainer,
          activeIndex,
          overContainer,
          overIndex,
          active.id
        );
      });
    } else {
      const currIdxContainer = Object.keys(items).indexOf(activeContainer)

      if (overIndex === 0) {
        setItems((items) => {
          return moveBetweenContainers(
            items,
            activeContainer,
            activeIndex,
            Object.keys(items)[currIdxContainer - 1],
            items[overContainer].length,
            active.id
          );
        })
      }
    }
  };

  /** When drag event ended **/
  const handleDragEnd = ({ active, over }) => {
    setDragged(false)
    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      let activeContainer = active.data.current.sortable.containerId;
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;

      if (activeContainer !== tableName) {
        let overContainer = over.data.current?.sortable.containerId || over.id;
        if (!items[activeContainer]) {
          activeContainer = ""
        }
        if (!items[overContainer]) {
          overContainer = ""
        }

        setItems((items) => {
          let newItems;
          if (activeContainer === overContainer) {
            newItems = {
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex
              )
            };
          } else {
            newItems = moveBetweenContainers(
              items,
              activeContainer,
              activeIndex,
              overContainer,
              overIndex,
              active.id
            );
          }

          return newItems;
        });
      } else {
        if (over.id !== noGroup) {
          let newGroupList = arrayMove(
            groupsOrder,
            activeIndex,
            overIndex
          )
          setGroupsOrder(newGroupList)
        }
      }
    }
  };

  /** Chen when the data move between container **/
  const moveBetweenContainers = (
    items,
    activeContainer,
    activeIndex,
    overContainer,
    overIndex,
    item
  ) => {
    if (overIndex === 0) {
      overIndex = 1
    }
    if (items[activeContainer] && items[overContainer]) {
      return {
        ...items,
        [activeContainer]: removeAtIndex(items[activeContainer], activeIndex),
        [overContainer]: insertAtIndex(items[overContainer], overIndex, item)
      };
    } else {
      return items
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={() => {
        setDragged(true)
        setDragMode(true)
      }}
      onDragOver={handleDragOver}
    >
      <table className={'DragDropTable'}>
        <SortableContext
          id={tableName} items={groupsOrder}
          strategy={rectSortingStrategy}>
          {groupsOrder.map((groupName, idx) => (
            <SortableContainer
              key={groupName}
              id={groupName}
              groupIdx={idx}
              data={data}
              items={items[groupName]}
              groupName={groupName}
              removeGroup={removeGroup}
              changeGroupName={changeGroupName}
              removeLayer={removeLayer}
              changeLayer={changeLayer}
              addLayerInGroup={addLayerInGroup}
              editLayerInGroup={editLayerInGroup}
              otherActionsFunction={otherActionsFunction}
              selectable={selectable}
              removeItems={removeItems}
            />
          ))}
        </SortableContext>
      </table>
    </DndContext>
  );
}
