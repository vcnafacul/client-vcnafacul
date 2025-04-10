import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { LogStudent } from "./studentCourseFull";
import { SocioeconomicAnswer } from "@/pages/partnerPrepInscription/data";

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  applicationStatus: StatusApplication;
  cod_enrolled: string;
  birthday: Date;
  photo: string;
  logs: LogStudent[];
  createdAt: Date;
  updatedAt: Date;
  socioeconomic: SocioeconomicAnswer[];
  isFree: string;
  areaInterest: string[];
  selectedCourses: string[];
}
