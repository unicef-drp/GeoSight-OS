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
 * __date__ = '06/06/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React, { useEffect, useState } from "react";
import CloudNativeGISStreamUpload from "./CloudNativeGISStreamUpload";
import { updateDataWithMapbox } from "../../../../utils/CloudNativeGIS";
import { GET_RESOURCE } from "../../../../utils/ResourceRequests";

/**
 * Cloud Native GIS specific fields
 * @param {dict} data Data of context layer.
 * @param {function} onSetData Set the data.
 */
export default function CloudNativeGISFields({ data, onSetData }) {
  const [initialized, setInitialized] = useState(false);
  const [dataFields, setDataFields] = useState(null);

  // Loading data
  useEffect(() => {
    if (data.cloud_native_gis_layer_id) {
      (async () => {
        const newData = await updateDataWithMapbox(data);
        if (data.last_update && newData.mapbox_style?.layers) {
          newData.styles = JSON.stringify(newData.mapbox_style.layers, null, 4);
        }
        onSetData(newData);
        setDataFields(null);
      })();
    }
  }, [data.last_update]);

  // Getting data fields
  useEffect(() => {
    (async () => {
      if (!dataFields) {
        if (data.cloud_native_gis_layer_id && !data.data_fields?.length) {
          try {
            const response = await GET_RESOURCE.CLOUD_NATIVE_GIS.ATTRIBUTES(
              data.cloud_native_gis_layer_id,
            );
            setDataFields(response);
          } catch (error) {}
        }
      }
    })();
  }, [data]);

  // Getting data fields
  useEffect(() => {
    if (!data.data_fields && dataFields) {
      onSetData({
        ...data,
        data_fields: dataFields,
      });
    }
  }, [data.data_fields, dataFields]);

  return (
    <div className="BasicFormSection">
      <label className="form-label required">Cloud Native GIS detail</label>
      <CloudNativeGISStreamUpload
        layerId={data.cloud_native_gis_layer_id}
        setLayerIdChanged={(id) => {
          if (id && initialized) {
            onSetData({
              ...data,
              cloud_native_gis_layer_id: id,
              last_update: new Date().getTime(),
              styles: null,
            });
          }
          setInitialized(true);
        }}
      />
    </div>
  );
}
