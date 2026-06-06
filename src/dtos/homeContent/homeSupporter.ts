export interface HomeSupporter {
  id: number;
  name: string;
  logoUrl: string | null;
  link: string;
  description?: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
