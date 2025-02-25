import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";

interface Documents {
  key: string;
  name: string;
  createdAt: Date;
  expiredAt: Date;
}

export interface LogStudent {
  id: string;
  studentId: string;
  applicationStatus: StatusApplication;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentCourseFull {
  id: string;
  cadastrado_em: Date;
  email: string;
  cpf: string;
  rg: string;
  uf: string;
  status: StatusApplication;
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
  genero: string;
  isento: string;
  convocar: string;
  lista_de_espera: string;
  photo:string;
}

export interface StudentCourseFullDtoInput extends StudentCourseFull {
  socioeconomic: string;
  logs: LogStudent[];
  documents: Documents[];
  data_convocacao: string | null;
  data_limite_convocacao: string | null;
  sended_email_recently: boolean;
}

export interface XLSXStudentCourseFull extends StudentCourseFull {
  socioeconomic: SocioeconomicAnswer[];
  logs: LogStudent[];
  documents: Documents[];
  data_convocacao: Date | null;
  data_limite_convocacao: Date | null;
}
