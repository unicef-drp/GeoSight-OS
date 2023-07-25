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
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {TreeItem} from './TreeItem';


const animateLayoutChanges = ({isSorting, wasDragging}) => !(isSorting || wasDragging);


export function SortableTreeItem(
  {
    id,
    depth,
    isGroup,
    changeGroupName,
    changeLayer,
    addLayerInGroup,
    removeGroup,
    ...props}) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundColor: isGroup ? 'var(--secondary-color)' : 'inherit',
    color: isGroup ? 'white' : 'inherit',
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableInteraction={isSorting}
      isGroup={isGroup}
      changeGroupName={changeGroupName}
      changeLayer={changeLayer}
      addLayerInGroup={addLayerInGroup}
      removeGroup={removeGroup}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
