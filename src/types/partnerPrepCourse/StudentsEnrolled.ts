import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { LogStudent } from "./studentCourseFull";
import { Paginate } from "@/utils/paginate";

export interface GetEnrolledDtoOutput {
  name: string;
  partnerId: string;
  students: Paginate<StudentsDtoOutput>;
}

export interface StudentsDtoOutput {
  id: string;
  name: string;
  socialName?: string;
  email: string;
  whatsapp: string;
  urgencyPhone?: string;
  applicationStatus: StatusApplication;
  cod_enrolled: string;
  birthday: Date;
  age: number;
  class?: {
    id: string;
    name: string;
    year: number;
    endDate: Date;
  };
  cpf?: string;
  inscriptionCourse?: {
    id: string;
    name: string;
  };
  photo: string;
  logs: LogStudent[];
}


/** Filtro por coluna da listagem de matriculados; vai para a api como `filter[field|value|operator]`. */
export interface FiltroDeEstudantes {
  field: string;
  value: string | number;
  operator: string;
}

/** Ordenação do servidor; vai para a api como `sort[field|order]`. */
export interface OrdenacaoDeEstudantes {
  field: string;
  sort: "asc" | "desc";
}
