export interface Paginate<T> {
  data: T[];
  page: number;
  limit: number;
  totalItems: number;
}