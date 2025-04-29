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
 * __date__ = '05/01/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export default class WebWorker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob(['(' + code + ')()']);
    return new Worker(URL.createObjectURL(blob));
  }
}

export function ExecuteWebWorker(script, data, callback, onePostMessage = true) {
  var _webWorker = new WebWorker(script);
  _webWorker.postMessage(data);
  _webWorker.addEventListener('message', (event) => {
    if (event.data?.isDone) {
      _webWorker.terminate()
      return
    }
    callback(event.data)
    if (onePostMessage) {
      _webWorker.terminate()
    }
  });
}