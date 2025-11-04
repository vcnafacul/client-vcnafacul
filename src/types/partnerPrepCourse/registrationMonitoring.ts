import { StatusApplication } from "@/enums/prepCourse/statusApplication";
import { LogStudent } from "./studentCourseFull";

export interface RegistrationMonitoring {
  id: string;
  studentId: string;
  partnerCourseName: string;
  inscriptionName: string;
  status: StatusApplication;
  logs: LogStudent[];
  createdAt: Date;
}
