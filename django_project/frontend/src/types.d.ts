export interface PaginationResult {
  count: number,
  next: string | null,
  previous: string | null,
  results: any[]
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