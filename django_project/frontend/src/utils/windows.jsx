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
 * __date__ = '13/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { v4 as uuidv4 } from "uuid";

/**
 * Create form window with url
 * @param url
 */
export const formWindow = (url) => {
  return new Promise((resolve, reject) => {
    let uuid = uuidv4();
    window.open(url, uuid, "popup=true");
    window.addEventListener('message', (event) => {
      if (event.source?.name === uuid) {
        resolve(event.data)
      }
    }, false);
  });

}