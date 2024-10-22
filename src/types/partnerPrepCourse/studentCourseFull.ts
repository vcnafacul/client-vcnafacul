import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";

export interface StudentCourseFullDTO {
  createdAt: string;
  email: string;
  cpf: string;
  rg: string;
  uf: string;
  urgencyPhone: string;
  socioeconomic: string;
  whatsapp: string;
  user: {
    firstName: string;
    lastName: string;
    socialName: string;
    birthday: string;
    gender: number;
    phone: string;
    neighborhood: string;
    street: string;
    number: string;
    complement: string;
    postalCode: string;
    city: string;
    state: string;
  };
}

export interface StudentCourseFull {
  createdAt: string;
  email: string;
  cpf: string;
  rg: string;
  uf: string;
  urgencyPhone: string;
  socioeconomic: SocioeconomicAnswer[];
  whatsapp: string;
  firstName: string;
  lastName: string;
  socialName: string;
  birthday: string;
  gender: string;
  phone: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
  postalCode: string;
  city: string;
  state: string;
}
