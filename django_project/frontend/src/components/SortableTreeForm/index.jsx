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

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty, untreeData, findAllGroups,
} from './utilities';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates';
import {TreeItem} from './TreeItem'
import {SortableTreeItem} from './SortableTreeItem';
import {Button} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './style.scss';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

export function SortableTree({
  data,
  collapsible,
  indicator,
  indentationWidth = 50,
  removable,
  rearrangeLayers,
  otherActionsFunction,
  changeGroupName,
  changeLayer,
  addLayerInGroup,
  removeGroup,
  removeLayer,
  ...props
}) {
  const [items, setItems] = useState(() => data);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [dragged, setDragged] = useState(false);
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!dragged) {
      setItems(data)
    }
  }, [data, dragged])

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce(
      (acc, {children, collapsed, id}) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indentationWidth)
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(() => flattenedItems.map(({id}) => id), [
    flattenedItems,
  ]);
  const activeItem = activeId
    ? flattenedItems.find(({id}) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements = {
    onDragStart(id) {
      return `Picked up ${id}.`;
    },
    onDragMove(id, overId) {
      return getMovementAnnouncement('onDragMove', id, overId);
    },
    onDragOver(id, overId) {
      return getMovementAnnouncement('onDragOver', id, overId);
    },
    onDragEnd(id, overId) {
      return getMovementAnnouncement('onDragEnd', id, overId);
    },
    onDragCancel(id) {
      return `Moving was cancelled. ${id} was dropped in its original position.`;
    },
  };

  const selectGroup = (group) => {
    const childIds = []
    for (const _data of flattenedItems) {
      if (_data.id === group) {
        childIds.push(_data.id)
        for (const child of _data.children) {
          if (child.children.length > 0) {
            childIds.push(...selectGroup(child.id))
          } else if (child.data) {
            childIds.push(child.data.id)
          }
        }
      }
    }
    return childIds
  }

  const select = (value, isGroup) => {
    if (isGroup) {
      const itemIds = selectGroup(value)
      if (selected.indexOf(value) >= 0) {
        setSelected(selected.filter(id => itemIds.indexOf(id) === -1))
      } else {
        setSelected([...selected, ...itemIds.filter(id => selected.indexOf(id) === -1)])
      }
      return
    }
    if (selected.indexOf(value) >= 0) {
      const unselectIds = [value]
      flattenedItems.forEach(item => {
        if (item.data && item.data.id === value) {
          if (selected.indexOf(item.data.group) >= 0) {
            unselectIds.push(item.data.group)
          }
        }
      })
      setSelected(selected.filter(id => unselectIds.indexOf(id) === -1))
    } else {
      setSelected([...selected, ...[value]])
    }
  }

  const deleteSelected = () => {
    for (const id of selected) {
      for (const item of flattenedItems) {
        if (!item.isGroup && item.data && item.data.id === id) {
          removeLayer(item.data)
        }
      }
    }
    setSelected([])
  }

  return (
    <div className='SortableTree'>
      <p>
        { selected.length > 0 ? <span className='SelectedContainer'> {selected.filter(id => typeof id === 'number').length} selected
          <Button className='DeleteItemsButton' size={'small'} variant={'text'} color={'error'} onClick={deleteSelected}><DeleteOutlineIcon/></Button></span> : <br/>}
      </p>
      <DndContext
      announcements={announcements}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(({id, name, isGroup, data, children, collapsed, depth, index}) => (
          <SortableTreeItem
            key={id + '-' + (index ? index : '')}
            id={id}
            value={id}
            name={name}
            data={data}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={indicator}
            collapsed={Boolean(collapsed && children.length)}
            onCollapse={
              collapsible && children.length
                ? () => handleCollapse(id)
                : undefined
            }
            onRemove={removable ? () => handleRemove(id) : undefined}
            isGroup={isGroup}
            selected={isGroup ? selected.indexOf(id) >= 0 : selected.indexOf(data.id) >= 0}
            otherActionsFunction={otherActionsFunction}
            changeGroupName={changeGroupName}
            changeLayer={changeLayer}
            addLayerInGroup={addLayerInGroup}
            removeGroup={removeGroup}
            select={select}
            {...props}
          />
        ))}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimation}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <TreeItem
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeId}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
    </div>
  );

  function handleDragStart({active: {id: activeId}}) {
    setActiveId(activeId);
    setOverId(activeId);
    setDragged(true)

    const activeItem = flattenedItems.find(({id}) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({delta}) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({over}) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({active, over}) {
    resetState();
    if (projected && over) {
      const {depth, parentId} = projected;
      const clonedItems = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === over.id);
      const activeIndex = clonedItems.findIndex(({id}) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      setItems(newItems);
      rearrangeLayers(untreeData(newItems))
      setTimeout(() => {
        setDragged(false)
      }, 500)
    }
  }

  function handleDragCancel() {
    resetState();
    setDragged(false)
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }

  function handleRemove(id) {
    setItems((items) => removeItem(items, id));
  }

  function handleCollapse(id) {
    setDragged(true)
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value;
      })
    );
    setTimeout(() => {
      setDragged(false)
    }, 500)
  }

  function getMovementAnnouncement(
    eventName,
    activeId,
    overId
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === overId);
      const activeIndex = clonedItems.findIndex(({id}) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId = previousSibling.parentId;
            previousSibling = sortedItems.find(({id}) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate = ({transform}) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
