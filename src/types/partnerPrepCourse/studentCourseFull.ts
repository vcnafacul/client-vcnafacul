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
  legalGuardian: {
    fullName: string;
    phone: string;
    rg?: string;
    uf?: string;
    cpf: string;
    family_relationship: string;
  }
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
  cadastrado_em: Date;
  email: string;
  cpf: string;
  rg: string;
  uf: string;
  telefone_emergencia: string;
  socioeconomic: SocioeconomicAnswer[];
  whatsapp: string;
  nome: string;
  sobrenome: string;
  nome_social: string;
  data_nascimento: string;
  genero: string;
  telefone: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  CEP: string;
  cidade: string;
  estado: string;
  nome_guardiao_legal: string;
  telefone_guardiao_legal: string;
  rg_guardiao_legal: string;
  uf_guardiao_legal: string;
  cpf_guardiao_legal: string;
  parentesco_guardiao_legal: string;
}
