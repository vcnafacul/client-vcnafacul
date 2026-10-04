import { AttendancePeriod } from "./attendancePeriod";

/**
 * Por que a presença foi editada (tickets-documentacao, card 05). Não é
 * justificativa de falta e não entra no cálculo; cada edição substitui.
 */
export interface ObservacaoDaPresenca {
  text: string;
  by: string | null;
  at: string | Date;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  registeredAt: Date;
  period: AttendancePeriod;
  studentAttendance: StudentAttendance[];
  registeredBy: {
    name: string;
    email: string;
  }
  createdAt: Date;
}

export interface StudentAttendance {
  id: string;
  present: boolean;
  justification?: string;
  observation?: ObservacaoDaPresenca | null;
  student: {
    name: string;
    cod_enrolled: string;
  }
}

export interface SimpleStudentAttendance {
  id: string;
  present: boolean;
  studentName: string;
  cod_enrolled: string;
  justification?: string;
  observation?: ObservacaoDaPresenca | null;
}

export interface AttendanceRecordByStudent {
  id: string;
  registeredAt: Date;
  period: AttendancePeriod;
  present: string;
  justification?: string;
  className: string;
}


