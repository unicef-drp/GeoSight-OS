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
 * __date__ = '02/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export interface User {
  id: string,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  is_staff: boolean,
  name: string,
  role: string,
  is_contributor: boolean,
  is_creator: boolean,
  is_admin: boolean,
  full_name: string,
  receive_notification: boolean
}