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
 * __date__ = '26/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { Permission } from "../../../index";

export interface RelatedTableField {
  example: string[];
  name: string;
  alias: string;
  type: "string" | "number";
}

export interface RelatedTable {
  id: number;
  name: string;
  url: string;
  version_data: number;
  related_fields: string[];
  fields_definition: RelatedTableField[];
  permission: Permission;
}
