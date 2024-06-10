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

import React, { useEffect, useState } from 'react';
import {
  CloudNativeGISInputSelector
} from "../../ModalSelector/InputSelector";
import { GET_RESOURCE } from "../../../../utils/ResourceRequests";

/**
 * Cloud Native GIS specific fields
 * @param {dict} data Data of context layer.
 * @param {function} onSetData Set the data.
 */
export default function CloudNativeGISFields(
  {
    data,
    onSetData
  }
) {
  const [info, setInfo] = useState(null)

  // Loading data
  useEffect(() => {
    if (data.cloud_native_gis_layer) {
      (
        async () => {
          setInfo(await GET_RESOURCE.CLOUD_NATIVE_GIS.DETAIL(data.cloud_native_gis_layer))
        }
      )()
    }
  }, [data.cloud_native_gis_layer])

  const onChange = value => {
    onSetData({ ...data, cloud_native_gis_layer: value[0]?.id })
    setInfo(value[0])
  }

  return (
    <div className='BasicFormSection'>
      <label className="form-label required">
        Layer
      </label>
      <CloudNativeGISInputSelector
        data={info ? [info] : []}
        setData={onChange}
        isMultiple={false}
        showSelected={true}
      />
    </div>
  )
}