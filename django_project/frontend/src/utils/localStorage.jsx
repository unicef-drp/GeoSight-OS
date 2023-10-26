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
 * __date__ = '25/10/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

export class LocalStorage {
  constructor(key) {
    this.key = key;
  }

  get() {
    return localStorage.getItem(this.key)
  }

  set(data) {
    return localStorage.setItem(this.key, data)
  }
}

export class LocalStorageData {
  constructor(key, version) {
    this.key = key;
    this.keyVersion = key + "-Version";
    this.version = version;
  }

  replaceData(data) {
    localStorage.setItem(this.keyVersion, this.version);
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  appendData(data) {
    let newData = []
    if (localStorage.getItem(this.keyVersion) === this.version) {
      if (localStorage.getItem(this.key)) {
        try {
          newData = JSON.parse(localStorage.getItem(this.key))
        } catch (err) {

        }
      }
    }
    const identifiers = []
    newData.map(row => {
      if (row) {
        identifiers.push(`${row.time} - ${row.concept_uuid}`)
      }
    })
    if (!identifiers.length) {
      newData = newData.concat(data)
    } else {
      data.map(row => {
        if (row && !identifiers.includes(`${row.time} - ${row.concept_uuid}`)) {
          newData.push(row)
        }
      })
    }
    localStorage.setItem(this.keyVersion, this.version);
    localStorage.setItem(this.key, JSON.stringify(newData));
  }

  get() {
    if (localStorage.getItem(this.key) && localStorage.getItem(this.keyVersion) === '' + this.version) {
      try {
        return JSON.parse(localStorage.getItem(this.key))
      } catch (err) {

      }
    }
    return null
  }
}
