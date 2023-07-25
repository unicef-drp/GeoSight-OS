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

const Match = {
  inList: {
    /***
     * Return value in list if and return if found.
     * @param {Array} list List of data that will be checked
     * @param {String} value Value that will be checked
     */
    match: (list, value) => {
      return list.find(
        member => {
          try {
            return ('' + member).toLowerCase() === ('' + value).toLowerCase()
          } catch (err) {
            return member === value
          }
        }
      )
    },
    /***
     * Return value in list if it is geocode. If not found, return first member.
     * @param {Array} list List of data that will be checked
     */
    geocode: (list = []) => {
      const found = list.find(
        member => ['geocode', 'ucode', 'geographycode', 'geography_code', 'pcode'].includes(('' + member).toLowerCase())
      )
      if (!found) {
        return list[0]
      }
      return found
    },
    /***
     * Return value in list if it is date. If not found, return first member.
     * @param {Array} list List of data that will be checked
     */
    date: (list = []) => {
      const found = list.find(
        member => ['date', 'datetime', 'date_time', 'time'].includes(('' + member).toLowerCase())
      )
      if (!found) {
        return list[0]
      }
      return found
    },
    /***
     * Return value in list if it is indicatorIdentifier. If not found, return first member.
     * @param {Array} list List of data that will be checked
     */
    indicatorIdentifier: (list = []) => {
      const found = list.find(
        member => ['shortcode', 'indicatorcode', 'indicator'].includes(('' + member).toLowerCase())
      )
      if (!found) {
        return list[0]
      }
      return found
    },
    /***
     * Return value in list if it is indicatorIdentifier. If not found, return first member.
     * @param {Array} list List of data that will be checked
     */
    adminLevel: (list = []) => {
      const found = list.find(
        member => ['admin_level', 'adminlevel', 'level'].includes(('' + member).toLowerCase())
      )
      if (!found) {
        return list[0]
      }
      return found
    }
  }
}
export default Match;