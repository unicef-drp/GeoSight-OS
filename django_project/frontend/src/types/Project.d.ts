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
 * __date__ = '02/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { Permission } from "./Permission";

export type Extent = [number, number, number, number];

export interface ReferenceLayer {
  identifier: string;
  detail_url: string;
  name: string;
  is_local: boolean;
}

export interface Project {
  id: string;               // Unique identifier for the project
  slug: string;             // Slug for the project
  icon: string | null;      // Icon for the project (can be null)
  thumbnail: string | null; // Thumbnail for the project (can be null)
  name: string;             // Name of the project
  description: string;      // Description of the project

  creator: number;          // ID of the creator
  created_at: string;       // Creation timestamp
  modified_at: string;      // Modification timestamp

  group: string;            // Group associated with the project
  category: string;         // Category of the project

  reference_layer: ReferenceLayer;  // ID of the reference layer
  extent: Extent;

  permission: Permission;   // Permissions object
}