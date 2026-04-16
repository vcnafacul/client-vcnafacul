import { AttendancePeriod } from "./attendancePeriod";

export interface AttendanceRecordHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  registeredAt: Date;
  period: AttendancePeriod;
  registeredBy: {
    user: {
      firstName: string;
      lastName: string;
    }
  }
}

export interface SimpleAttendanceRecordHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  registeredAt: Date;
  period: AttendancePeriod;
  registeredBy: string;
}
