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

import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone-uploader";
import { fetchJSON } from "../../../../Requests";

export default function CloudNativeGISStreamUpload({
  layerId,
  setLayerIdChanged,
  onError,
}) {
  const uploadFileUrl = urls.api.cloudNativeGISUploadFile;
  const [lastImporter, setLastImporter] = useState(null);
  const getUploadParams = ({ meta, file }) => {
    const body = new FormData();
    body.append("file", file);
    body.append("id", meta.id);
    const headers = {
      "Content-Disposition": "attachment; filename=" + meta.name,
      "X-CSRFToken": csrfmiddlewaretoken,
    };
    return { url: uploadFileUrl, body, headers };
  };

  /**
   * Check if importer is done
   * @param importer
   * @returns {boolean}
   */
  const isDone = (importer) => {
    return !!(importer.id && ["Failed", "Success"].includes(importer.status));
  };

  const handleChangeStatus = ({ meta, file, xhr }, status) => {
    if (["done", "error_upload"].includes(status)) {
      if (status === "error_upload") {
        if (xhr.status === 413) {
          onError(
            "Your file is too large. The maximum allowed size is 100 MB.",
          );
        } else {
          onError(xhr.statusText);
        }
      }
      const _id = parseInt(xhr.response);
      if (!isNaN(_id)) {
        urls.api.cloudNativeGISUploadFile =
          urls.api.cloudNativeGISUploadFileMain.replace("0", _id);
        setLayerIdChanged(_id);
      }
      setLastImporter(null);
      fetch(null);
    }
  };
  const handleSubmit = (files) => {
    return;
  };
  if (!uploadFileUrl) {
    return null;
  }

  /**
   * Fetch last importer.
   */
  const fetch = (importer) => {
    if (!layerId || importer) {
      setLayerIdChanged(layerId);
      return;
    }
    fetchJSON(
      urls.api.cloudNativeGISImportHistory.replace("0", layerId),
      {},
      false,
    ).then((data) => {
      data = data.results[0];
      setLastImporter(data);
      if (!data?.id) {
        return;
      }
      if (!isDone(data)) {
        setTimeout(function () {
          fetch();
        }, 1000);
      } else {
        setLayerIdChanged(layerId);
      }
    });
  };

  // Fetch the last importer
  useEffect(() => {
    fetch(lastImporter);
  }, [layerId]);

  return (
    <>
      <div className="UploadFile">
        <b>Last upload</b>
        {!lastImporter?.id ? (
          <div>No import yet</div>
        ) : (
          <>
            <div>{lastImporter.created_at}</div>
            <div>
              Status : <b>{lastImporter.status}</b>
            </div>
            <div>Progress : {lastImporter.progress}</div>
          </>
        )}
      </div>
      {!lastImporter?.id || isDone(lastImporter ? lastImporter : {}) ? (
        <div
          className="BasicFormSection UploadFile"
          style={{ borderTop: "unset" }}
        >
          <b>Change data by uploading zipped shapefile.</b>
          <br />
          <div className="InputInLine">
            <Dropzone
              getUploadParams={getUploadParams}
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              accept=".zip"
              multiple={false}
              inputContent={
                "Click to browse for a file in one of these formats: a zipped file containing a shapefile."
              }
              PreviewComponent={(preview) => {
                return <div></div>;
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
