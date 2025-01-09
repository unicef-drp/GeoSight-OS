export interface PaginationResult {
  count: number,
  next: string | null,
  previous: string | null,
  results: any[]
}