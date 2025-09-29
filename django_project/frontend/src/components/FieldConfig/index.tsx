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
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "../../utils/Array";
import SortableItem from "../../pages/Admin/Dashboard/Form/ListForm/SortableItem";
import { Select } from "../Input";
import { DataField } from "../../types/IndicatorLayer";

import "./style.scss";

export interface Props {
  data_fields: DataField[];
  update: (fields: DataField[]) => void;
}

/** Arcgis Config Fields */
export default function FieldConfig({ data_fields, update }: Props) {
  const [fields, setFields] = useState([]);
  const [items, setItems] = useState([]);
  const prevState = useRef<string | null>(null);

  /** Update data **/
  const updateData = (newFields: DataField[]) => {
    const serialized = JSON.stringify(newFields);
    if (prevState.current !== serialized) {
      update(newFields);
      prevState.current = serialized;
    }
  };

  const id = "Fields";
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Data Updated
  const initData = (fields: DataField[]) => {
    setFields(fields);
    if (fields) {
      setItems(
        fields.map((field: DataField, idx) => {
          return idx + 1;
        }),
      );
    } else {
      setItems([]);
    }
  };

  // When the data changed
  useEffect(() => {
    initData(data_fields);
  }, [data_fields]);

  // When item changed
  useEffect(() => {
    if (items.length) {
      const newFields: DataField[] = [];
      items.map((item) => {
        newFields.push(fields[item - 1]);
      });
      updateData(newFields);
    }
  }, [items]);

  /** When drag event ended **/
  // @ts-ignore
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      let newList = arrayMove(items, activeIndex, overIndex);
      setItems(newList);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <table className="FieldConfig">
        <thead>
          <tr>
            <td></td>
            <td valign="top">Field</td>
            <td valign="top">Alias</td>
            <td valign="top">Visible in Popup</td>
            <td valign="top">Type</td>
          </tr>
        </thead>
        <tbody key={id} id={id} style={style} ref={setNodeRef}>
          <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
            {items.map((item) => {
              const idx = item - 1;
              let field = fields[idx];
              const optionsTypes = [
                { value: "string", label: "String" },
                { value: "number", label: "Number" },
                { value: "date", label: "Date" },
              ];
              let type = optionsTypes.find((opt) => opt.value === field.type);
              if (!type) {
                field.type = "string";
              }
              type = optionsTypes.find((opt) => opt.value === field.type);

              // Can't update name and type
              let disabled: any = {};
              if (field.name === "context.current.indicator.attributes") {
                field.alias = "";
                disabled.alias = true;
                disabled.type = true;
              }
              return (
                // @ts-ignore
                <SortableItem key={item} id={item}>
                  <td>{field.name}</td>
                  <td>
                    <input
                      value={field.alias}
                      onChange={(evt) => {
                        field.alias = evt.target.value;
                        updateData(fields);
                      }}
                      disabled={!!disabled?.alias}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={
                        field.visible === undefined ? true : field.visible
                      }
                      onChange={(evt) => {
                        field.visible = evt.target.checked;
                        updateData(fields);
                      }}
                    />
                  </td>
                  <td>
                    <Select
                      options={optionsTypes}
                      defaultValue={type}
                      onChange={(evt: any) => {
                        field.type = evt.value;
                        updateData(fields);
                      }}
                      isDisabled={!!disabled?.type}
                    />
                  </td>
                </SortableItem>
              );
            })}
          </SortableContext>
        </tbody>
      </table>
    </DndContext>
  );
}
