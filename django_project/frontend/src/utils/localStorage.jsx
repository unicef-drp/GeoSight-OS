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
import { compressLZW, decompressLZW } from "./compress";

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
    this.setItem(data);
  }

  appendData(data) {
    let newData = []
    if (localStorage.getItem(this.keyVersion) === '' + this.version) {
      if (this.getItem()) {
        try {
          newData = JSON.parse(this.getItem())
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
    newData.sort(function (p1, p2) {
      return (p1.time < p2.time) ? 1 : (p1.time > p2.time) ? -1 : 0;
    });

    localStorage.setItem(this.keyVersion, this.version);
    this.setItem(newData);
  }

  getItem() {
    return decompressLZW(localStorage.getItem(this.key), true)
  }

  setItem(data) {
    localStorage.setItem(this.key, compressLZW(data));
  }

  get() {
    if (localStorage.getItem(this.key) && localStorage.getItem(this.keyVersion) === '' + this.version) {
      try {
        return this.getItem()
      } catch (err) {

      }
    }
    return null
  }
}
