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
import Dropzone from 'react-dropzone-uploader'
import { fetchJSON } from "../../../../Requests";

export default function StreamUploadFile() {
  const [lastImporter, setLastImporter] = useState(null);
  const getUploadParams = ({ meta, file }) => {
    const body = new FormData()
    body.append('file', file)
    body.append('id', meta.id)
    const headers = {
      'Content-Disposition': 'attachment; filename=' + meta.name,
      'X-CSRFToken': csrfmiddlewaretoken
    }
    return { url: urls.api.uploadFile, body, headers }
  }

  /**
   * Check if importer is done
   * @param importer
   * @returns {boolean}
   */
  const isDone = (importer) => {
    return !!(importer.id && ['Failed', 'Success'].includes(importer.status))
  }

  const handleChangeStatus = ({ meta, file }, status) => {
    if (['done', 'error_upload'].includes(status)) {
      fetch()
    }
  }
  const handleSubmit = (files) => {
  }
  if (!urls.api.uploadFile) {
    return null
  }

  /**
   * Fetch last importer.
   */
  const fetch = () => {
    setLastImporter(null)
    fetchJSON(urls.api.lastImporter, {}, false)
      .then(data => {
        setLastImporter(data)
        if (!data.id) {
          return
        }
        if (!isDone(data)) {
          setTimeout(function () {
            fetch()
          }, 1000);
        }
      })
  }
  // Fetch the last importer
  useEffect(() => {
    fetch()
  }, [])

  return <>
    <div className='UploadFile'>
      <b>Last upload</b>
      {
        !lastImporter ? <div>Loading</div> : !lastImporter.id ?
          <div>No import yet</div> : <>
            <div>{lastImporter.created_at}</div>
            <div>Status : <b>{lastImporter.status}</b></div>
            <div>Progress : {lastImporter.progress}</div>
          </>
      }
    </div>
    {
      lastImporter && (!lastImporter.id || isDone(lastImporter)) ?
        <div
          className='BasicFormSection UploadFile'
          style={{ borderTop: "unset" }}>
          <b>
            Change data by uploading zipped shapefile.
          </b>
          <br/>
          <div className='InputInLine'>
            <Dropzone
              getUploadParams={getUploadParams}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              accept=".zip"
              multiple={false}
              inputContent={'Drag and drop or click to browse for a file in one of these formats: a zipped file containing a shapefile.'}
              PreviewComponent={
                preview => {
                  return <div></div>
                }
              }
            />
          </div>
        </div> : null
    }
  </>
}