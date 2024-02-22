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
 * __date__ = '22/02/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from 'react';
import Dropzone from 'react-dropzone-uploader'

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import { AdminForm } from "../../Components/AdminForm";
import UploadComponent from "./Preview";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import 'react-dropzone-uploader/dist/styles.css'
import './style.scss';
import { CSS } from '@dnd-kit/utilities';

export const ALLOWABLE_FILE_TYPES = [
  'application/geo+json',
  'application/zip',
  'application/json',
  'application/x-zip-compressed',
  '.gpkg'
]

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      Test
    </div>
  );
}

/**
 * Upload entities
 */
export default function ImporterEntityForm() {
  const [items, setItems] = useState([])
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }


  const getUploadParams = ({ meta }) => {
    return { url: 'https://httpbin.org/post' }
  }

  const handleChangeStatus = ({ meta, file }, status) => {
    switch (status) {
      case 'preparing': {
        if (!items.includes(meta.id)) {
          items.push(meta.id)
          setItems([...items])
        }
      }
    }
  }

  const handleSubmit = (files) => {
    // console.log(files.map(f => f.meta))
  }
  console.log(items)
  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.ReferenceLayerView}
    >
      <AdminForm
        forms={{
          'Files': <div>
            <Dropzone
              getUploadParams={getUploadParams}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              accept={ALLOWABLE_FILE_TYPES.join(', ')}
              inputContent={'Drag and drop or click to browse for a file in one of these formats: .json, .geojson, .gpkg or a zip file containing a shapefile.'}
              PreviewComponent={
                preview => <UploadComponent {...preview}/>
              }
            />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map(id => <SortableItem key={id} id={id}/>)}
              </SortableContext>
            </DndContext>
          </div>,
        }}
      />
    </Admin>
  );
}

render(ImporterEntityForm, store)