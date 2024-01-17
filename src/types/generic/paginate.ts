export interface Paginate<T> {
  totalCount: number;
  data: T[];
  page: number;
  limit: number;
}