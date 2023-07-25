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

import React, { useEffect, useState } from 'react';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
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
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "../../../../../../../utils/Array";
import ColorSelector from "../../../../../../../components/Input/ColorSelector";
import SortableItem
  from '../../../../../../Admin/Dashboard/Form/ListForm/SortableItem'


export default function MultiIndicatorStyle({ data, indicators, updateData }) {
  const [items, setItems] = useState([]);

  // When item changed
  useEffect(() => {
    if (data.indicators.length) {
      setItems(data.indicators.map(indicator => {
        return indicator.id
      }))
    }
  }, [data])

  const id = 'Styles'
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  /** When drag event ended **/
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      let newList = arrayMove(
        items,
        activeIndex,
        overIndex
      )
      setItems(newList)

      // Order changed
      const indicators = []
      newList.map(item => {
        indicators.push(data.indicators.find(
          indicator => indicator.id === item
        ))
      })
      data.indicators = indicators
      updateData()
    }
  };

  /** Delete Style Row **/
  const deleteStyleRow = (row) => {
    data.indicators = data.indicators.filter(indicator => indicator.id !== row.id)
    updateData()
  }
  return <DndContext
    sensors={sensors}
    onDragEnd={handleDragEnd}
  >
    <table className='MultipleItemRowTable'>
      <thead>
      <tr>
        <th></th>
        <th></th>
        <th>Indicator</th>
        <th>Label</th>
        <th>Color</th>
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext
        id={id} items={items}
        strategy={rectSortingStrategy}>
        {
          items.map(item => {
            let indicator = data.indicators.find(
              indicator => indicator.id === item
            )
            if (!indicator) {
              return ""
            }
            const indicatorData = indicators.find(
              indicatorData => indicator.id === indicatorData.id
            )
            if (!indicatorData) {
              return ""
            }
            return (
              <SortableItem key={indicator.id} id={item}>
                <td>
                  <RemoveCircleIcon
                    className='MuiButtonLike RemoveButton'
                    onClick={(evt) => {
                      deleteStyleRow(indicator)
                    }}
                  />
                </td>
                <td>{indicatorData.name}</td>
                <td>
                  <input
                    type="text" spellCheck="false"
                    value={indicator.name}
                    onChange={evt => {
                      indicator.name = evt.target.value
                      updateData()
                    }}/>
                </td>
                <td>
                  <ColorSelector
                    color={indicator.color}
                    onChange={evt => {
                       indicator.color = evt.target.value
                       updateData()
                     }}
                    hideInput={false}
                    fullWidth={false}
                  />
                </td>
              </SortableItem>
            )
          })
        }
      </SortableContext>
      </tbody>
    </table>
  </DndContext>
}