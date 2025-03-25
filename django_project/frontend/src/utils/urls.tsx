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
 * __date__ = '14/02/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { DatasetView } from "../types/DatasetView";
import { GeorepoUrls } from "./georepo";

export const referenceDatasetUrlBase = 'reference-datasets'
export const InternalReferenceDatasets = {
  list: () => {
    return `/api/v1/${referenceDatasetUrlBase}/`
  },
  detail: (identifier: string) => {
    return `${window.location.origin}/api/v1/${referenceDatasetUrlBase}/${identifier}/`
  },
  centroid: (identifier: string) => {
    return `${window.location.origin}/reference-dataset/${referenceDatasetUrlBase}/${identifier}/centroid`
  }
}

export const URLS = {
  ReferenceLayer: {
    List: function (dataset: string, isLocal: boolean) {
      if (isLocal) {
        return InternalReferenceDatasets.list()
      }
      return GeorepoUrls.ViewList(dataset)
    },
    Detail: function (detail: DatasetView) {
      const { identifier } = detail
      if (detail.is_local) {
        return InternalReferenceDatasets.detail(identifier)
      } else {
        return GeorepoUrls.ViewDetail(identifier)
      }
    },
    Centroid: function (detail: DatasetView) {
      const { identifier } = detail
      if (detail.is_local) {
        return InternalReferenceDatasets.centroid(identifier)
      } else {
        return GeorepoUrls.Centroid(identifier)
      }
    }
  }
}