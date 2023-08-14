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
import { arrayMove } from "../../../../../utils/Array";
import SortableItem
  from '../../../../Admin/Dashboard/Form/ListForm/SortableItem'
import { capitalize } from "../../../../../utils/main";
import ColorSelector from "../../../../../components/Input/ColorSelector";


/**
 * Multi selected row config
 * @param {Array} selectedItems Selected items that will be used.
 * @param {Function} setSelectedItems Selected items changed.
 * @param {Boolean} configEnabled If config enabled.
 * @param {Array} additionalFields Additional Fields.
 * @param {dict} props Other props
 */
export default function MultiSelectorConfigRows(
  {
    selectedItems,
    setSelectedItems,
    configEnabled,
    additionalFields = [],
    ...props
  }
) {
  const [items, setItems] = useState([]);

  // When selected item changes
  useEffect(() => {
    setItems(selectedItems.map(item => item.id))
  }, [selectedItems])

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
      const newSelectedItems = []
      newList.map(item => {
        newSelectedItems.push(selectedItems.find(
          selectedItem => selectedItem.id === item
        ))
      })
      setSelectedItems(newSelectedItems)
    }
  };

  /** Delete Style Row **/
  const deleteStyleRow = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id))
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
        {
          props.headers ?
            props.headers.map(field => {
              return <th>{capitalize(field)}</th>
            }) : <Fragment>
              <th>Name</th>
              {
                additionalFields.map(field => {
                  return <th>{capitalize(field)}</th>
                })
              }
              <th>Color</th>
            </Fragment>
        }
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext
        id={id} items={items}
        strategy={rectSortingStrategy}>
        {
          items.map((item, idx) => {
            let selectedItem = selectedItems.find(option => option.id === item)
            if (!selectedItem) {
              return null
            }
            return (
              <SortableItem key={selectedItem.id} id={item}>
                <td>
                  <RemoveCircleIcon
                    className='MuiButtonLike RemoveButton'
                    onClick={(evt) => {
                      deleteStyleRow(item)
                    }}
                  />
                </td>
                <td>{selectedItem.indicator ? selectedItem.indicator : selectedItem.name}</td>
                {
                  additionalFields.map(field => {
                    return <td>
                      <input
                        type="text"
                        disabled={!configEnabled}
                        value={selectedItem[field]}
                        onChange={evt => {
                          selectedItem[field] = evt.target.value
                          setSelectedItems([...selectedItems])
                        }}
                        spellCheck="false"/>
                    </td>
                  })
                }
                {
                  props.noColor ? null :
                    <td>
                      <ColorSelector
                        color={selectedItem.color}
                        onChange={evt => {
                          selectedItem.color = evt.target.value
                          setSelectedItems([...selectedItems])
                        }}
                        disabled={!configEnabled}
                      />
                    </td>
                }
                {
                  !props.action ? null :
                    <td>
                      {
                        React.cloneElement(props.action, {
                          indicator: selectedItem,
                          update: item => {
                            selectedItems[idx] = item
                            setSelectedItems([...selectedItems])
                          }
                        })
                      }
                    </td>
                }
              </SortableItem>
            )
          })
        }
      </SortableContext>
      </tbody>
    </table>
  </DndContext>
}