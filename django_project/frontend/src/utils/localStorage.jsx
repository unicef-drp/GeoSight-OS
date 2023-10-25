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
  constructor(keyData, keyVersion, version) {
    this.keyData = keyData;
    this.keyVersion = keyVersion + "-Version";
    this.version = version;
  }

  save(data) {
    localStorage.setItem(this.keyVersion, this.version);
    localStorage.setItem(this.keyData, JSON.stringify(data));
  }

  get() {
    if (localStorage.getItem(this.keyData) && localStorage.getItem(this.keyVersion) === this.version) {
      return JSON.parse(localStorage.getItem(this.keyData))
    }
    return null
  }

  async getOrCreate(onNoData) {
    const storageData = this.get()
    if (storageData) {
      return storageData
    } else {
      const data = await onNoData()
      this.save(data)
      return data
    }
  }
}
