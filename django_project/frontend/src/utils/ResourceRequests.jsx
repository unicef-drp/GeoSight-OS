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

import { fetchingData } from "../Requests";

export const GET_RESOURCE = {
  CLOUD_NATIVE_GIS: {
    DETAIL: async (id) => {
      let data = null
      await fetchingData(
        `/api/v1/cloud-native-gis-layer/${id}`,
        {}, {}, (response, error) => {
          data = response
        }
      )
      return data
    }
  }
}