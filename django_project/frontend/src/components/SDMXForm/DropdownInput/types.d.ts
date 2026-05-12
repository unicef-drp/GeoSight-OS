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

import { SDMXConfig, SDMXDataForm } from "../../../types/SDMX";
import { SelectOption } from "../../../types/Input";

/** Shared props for value-controlled dropdown inputs. */
interface MainDropdownInputProps {
  selectedValue: string | null;
  onChangeValue: (value: string) => void;
}

/** Props for the base DropdownInput component. */
interface MainDropdownProps extends MainDropdownInputProps {
  title: string;
  options: SelectOption[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;

  loadingByInit?: boolean;
}

/** Props for dropdowns that require an SDMX config to resolve their URL. */
interface MainDropdownInputSDMXProps extends MainDropdownInputProps {
  sdmxConfig: SDMXConfig;
  sdmxDataForm?: SDMXDataForm;
  disabled?: boolean;
}
