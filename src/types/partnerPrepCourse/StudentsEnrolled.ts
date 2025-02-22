import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { LogStudent } from "./studentCourseFull";
import { Paginate } from "@/utils/paginate";

export interface GetEnrolledDtoOutput {
  name: string;
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
  photo: string;
  logs: LogStudent[];
}

