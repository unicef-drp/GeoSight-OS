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
 * __date__ = '07/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
/**
 * Functions to storage session per name
 */
let sessions = {}

/***
 * Checking session
 * Expired is in seconds. 0 is no expires
 */
export class Session {
  constructor(name, expires = 0) {
    this.name = name;
    this.currentSession = new Date().getTime()
    this.expires = expires
    sessions[name] = this.currentSession
  }

  get isValid() {
    if (this.expires) {
      const now = new Date().getTime()
      return sessions[this.name] === this.currentSession && now < this.currentSession + this.expires
    }
    return sessions[this.name] === this.currentSession
  }
}
