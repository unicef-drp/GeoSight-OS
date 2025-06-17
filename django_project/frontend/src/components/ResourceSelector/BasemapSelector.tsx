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
 * __date__ = '17/06/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React from "react";
import { ModalInputSelector } from "./ModalInputSelector";
import { ModalFilterSelectorProps, ModalInputSelectorProps } from "./types";

const columns = [
  { field: "id", headerName: "id", hide: true },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "description", headerName: "Description", flex: 1 },
  { field: "category", headerName: "Category", flex: 1 },
];

/** For Georepo View selection. */
export default function BasemapSelector({
  url = "/api/v1/basemaps/?fields=__all__",

  // Input properties
  placeholder,
  showSelected,
  disabled,
  mode,
  opener,

  // Data properties
  initData,

  // Listeners
  dataSelected,

  // Table properties
  multipleSelection,
  defaults,
}: ModalInputSelectorProps) {
  return (
    <ModalInputSelector
      // Input properties
      placeholder={placeholder}
      showSelected={showSelected}
      disabled={disabled}
      mode={mode}
      dataName={"Basemap"}
      opener={opener}
      // Data properties
      initData={initData}
      // Listeners
      url={url}
      columns={columns}
      dataSelected={(data: any) => {
        if (dataSelected) {
          dataSelected(data);
        }
      }}
      // Table properties
      multipleSelection={multipleSelection}
      defaults={defaults}
    />
  );
}