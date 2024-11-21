import { StatusEnum } from "@/enums/generic/statusEnum";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";
import { Gender } from "@/store/auth";

interface StudentCourseFull {
  id: string;
  cadastrado_em: Date;
  convocado_em: Date;
  email: string;
  cpf: string;
  rg: string;
  uf: string;
  telefone_emergencia: string;
  whatsapp: string;
  nome: string;
  sobrenome: string;
  nome_social: string;
  data_nascimento: Date;
  telefone: string;
  bairro: string;
  rua: string;
  numero: number;
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

export interface StudentCourseFullDtoInput extends StudentCourseFull {
  genero: Gender;
  deferido: StatusEnum;
  socioeconomic: string;
  isento: boolean;
  matriculado: boolean;
  convocado: boolean;
  convocado_antes: boolean;
  lista_de_espera: boolean;
}

export interface XLSXStudentCourseFull extends StudentCourseFull {
  genero: string;
  deferido: string;
  socioeconomic: SocioeconomicAnswer[];
  isento: string;
  matriculado: string;
  convocado: string;
  convocado_antes: string;
  lista_de_espera: string;
}
