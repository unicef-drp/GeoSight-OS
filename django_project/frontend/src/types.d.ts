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

export interface Indicator {
  id: string,
  name: string,
  category: string,
  description: string,
  shortcode: string,
  type: string
}