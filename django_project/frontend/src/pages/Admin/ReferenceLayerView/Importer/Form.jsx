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

import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import Dropzone from 'react-dropzone-uploader'

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import { AdminForm } from "../../Components/AdminForm";
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import PreviewComponent from "./Preview";
import { dictDeepCopy } from "../../../../utils/main";
import { DjangoRequests } from "../../../../Requests";

import 'react-dropzone-uploader/dist/styles.css'
import './style.scss';

export const ALLOWABLE_FILE_TYPES = [
  'application/geo+json',
  'application/zip',
  'application/json',
  'application/x-zip-compressed',
  '.gpkg'
]

/**
 * Upload entities
 */
export default function ImporterEntityForm() {
  const [itemMeta, setItemMeta] = useState({})
  const [items, setItems] = useState([])
  const [id, setId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function rearrange() {
    DjangoRequests.post(
      urls.api.rearrange, {
        createdAt: createdAt,
        orders: items
      }
    )
  }

  useEffect(
    () => {
      rearrange()
    }, [items]
  )


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


  const getUploadParams = ({ meta, file }) => {
    const body = new FormData()
    body.append('file', file)
    body.append('id', meta.id)
    body.append('level', items.indexOf(meta.id))
    body.append('createdAt', createdAt)
    const headers = {
      'Content-Disposition': 'attachment; filename=' + meta.name,
      'X-CSRFToken': csrfmiddlewaretoken
    }
    return { url: urls.api.uploadFile, body, headers }
  }

  const handleChangeStatus = ({ meta, file, xhr }, status) => {
    switch (status) {
      case 'preparing': {
        if (!items.includes(meta.id)) {
          items.push(meta.id)
          setItems([...items])
        }
      }
      case 'done': {
        if (xhr) {
          const { importer, properties } = JSON.parse(xhr.responseText);
          meta.properties = properties
          setId(importer)
          rearrange()
        }
      }
    }
  }

  const handleSubmit = (files) => {
    $('form').submit()
  }

  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.ReferenceLayerView}
    >
      <AdminForm
        action={id ? window.location.href.split('#')[0] + '/' + id : ''}
        forms={{
          'Files': <>
            <input
              type="hidden" name="csrfmiddlewaretoken"
              value={csrftoken}/>
            {/* DROPZONE */}
            <Dropzone
              initialFiles={dataLevels}
              getUploadParams={getUploadParams}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              accept={ALLOWABLE_FILE_TYPES.join(', ')}
              inputContent={'Drag and drop or click to browse for a file in one of these formats: .json, .geojson, .gpkg or a zip file containing a shapefile.'}
              PreviewComponent={
                preview => {
                  // -----------------------------
                  // Save meta
                  const meta = dictDeepCopy(preview.meta)
                  let update = false
                  if (!itemMeta[meta.id]) {
                    update = true
                  } else {
                    if (JSON.stringify(itemMeta[meta.id]) !== JSON.stringify(meta)) {
                      update = true
                    }
                  }
                  // -----------------------------
                  if (update) {
                    itemMeta[meta.id] = meta
                    setItemMeta({ ...itemMeta })
                  }
                  return <div></div>
                }
              }
            />
            <div className='DraggableSection'>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  {/* This is D&D Section*/}
                  {
                    items.map(
                      id => <PreviewComponent
                        key={id} id={id}
                        meta={{
                          ...itemMeta[id],
                          level: items.indexOf(id)
                        }}/>)
                  }
                </SortableContext>
              </DndContext>
            </div>
          </>,
        }}
      />
    </Admin>
  );
}

render(ImporterEntityForm, store)