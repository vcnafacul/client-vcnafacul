export interface PartnerPrepCourse {
  id: string;
  geo: {
    id: string;
    name: string;
    category: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    phone: string;
  };
  representative: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  logo: string;
  thumbnail: string;
  number_students: number;
  number_members: number;
  createdAt: string;
  updatedAt: string;
}
