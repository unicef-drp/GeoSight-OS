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
 * __date__ = '30/04/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React from "react";
import { MainDropdownInputProps } from "./types";
import { DropdownInput } from "./BaseDropdownInput";
import { SDMXConfig } from "../../../types/SDMX";

/** Dropdown pre-populated with all available SDMX configs from the global sdmxData list. */
export const SMDXConfigSelector = ({
  selectedValue,
  onChangeValue,
}: MainDropdownInputProps) => {
  // @ts-ignore
  const sdmxConfigList: SDMXConfig[] = sdmxData;

  return (
    <DropdownInput
      title={"SDMX Config"}
      options={sdmxConfigList.map((config) => {
        return { value: config.id, label: config.name };
      })}
      loading={false}
      error={null}
      selectedValue={selectedValue}
      onChangeValue={onChangeValue}
    />
  );
};

export default SMDXConfigSelector;
