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
import { getCurrentLanguage } from './i18n';

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
  },
  COUNTRY: {
    List: () => {
      return `${window.location.origin}/api/v1/${referenceDatasetUrlBase}/entity?admin_level=0`
    }
  }
}

export const URLS = {
  ReferenceLayer: {
    VIEW: {
      List: function (dataset: string, isLocal: boolean) {
        const lang = getCurrentLanguage();
        if (isLocal) {
          return `/${lang}${InternalReferenceDatasets.list()}?page=1&page_size=25`;
        }
        return `/${lang}${GeorepoUrls.ViewList(dataset)}`;
      },
      Detail: function (detail: DatasetView) {
        const { identifier } = detail;
        const lang = getCurrentLanguage();
        if (detail.is_local) {
          return `/${lang}${InternalReferenceDatasets.detail(identifier)}`;
        } else {
          return `/${lang}${GeorepoUrls.ViewDetail(identifier)}`;
        }
      },
      Centroid: function (detail: DatasetView) {
        const { identifier } = detail;
        const lang = getCurrentLanguage();
        if (detail.is_local) {
          return `/${lang}${InternalReferenceDatasets.centroid(identifier)}`;
        } else {
          return `/${lang}${GeorepoUrls.Centroid(identifier)}`;
        }
      }
    },
    COUNTRY: {
      List: function (dataset: string, isLocal: boolean) {
        const lang = getCurrentLanguage();
        if (isLocal) {
          return `/${lang}${InternalReferenceDatasets.COUNTRY.List()}`;
        }
        return `/${lang}${GeorepoUrls.CountryList(dataset)}`;
      },
    }
  }
}