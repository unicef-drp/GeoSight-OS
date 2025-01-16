/** The data when the request to backend **/
export interface RequestState {
  data: any;
  error: string | null;
  fetched: boolean
  fetching: boolean
  receivedAt: number
}

export interface PaginationResult {
  count: number,
  next: string | null,
  previous: string | null,
  results: any[]
}

export interface DatasetView {
  name: string,
  uuid: string,
  description: string,
  dataset: string,
  root_entity: string,
  last_update: string,
  bbox: number[],
  tags: string[]
}

export interface Group {
  id: string,
  name: string,
}

export interface User {
  id: string,
  username: string,
  email: string,
  first_name: string,
  last_name: string,
  is_staff: boolean,
  name: string,
  role: string,
  is_contributor: boolean,
  is_creator: boolean,
  is_admin: boolean,
  full_name: string,
  receive_notification: boolean
}

export interface Indicator {
  id: string,
  name: string,
  category: string,
  description: string,
  shortcode: string,
  type: string
}

type Permission = {
  list: boolean;
  read: boolean;
  edit: boolean;
  share: boolean;
  delete: boolean;
}

export interface GeoSightProject {
  id: string;               // Unique identifier for the project
  slug: string;             // Slug for the project
  icon: string | null;      // Icon for the project (can be null)
  name: string;             // Name of the project
  created_at: string;       // Creation timestamp
  modified_at: string;      // Modification timestamp
  description: string;      // Description of the project
  group: string;            // Group associated with the project
  category: string;         // Category of the project
  permission: Permission;   // Permissions object
  reference_layer: number;  // ID of the reference layer
  creator: number;          // ID of the creator
}