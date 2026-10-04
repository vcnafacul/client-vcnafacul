import { AttendancePeriod } from "@/types/partnerPrepCourse/attendancePeriod";

export interface AttendanceRecordItem {
  date: string,
  period: AttendancePeriod,
  total: number
  presentCount: number
}
export interface AttendanceRecordSummaryByDate {
  class: {
    name: string;
    year: number;
  },
  startDate: Date;
  endDate: Date;
  classReport: AttendanceRecordItem[];
  generalReport: AttendanceRecordItem[];
}

export interface AttendanceRecordSummaryByStudent {
  class: {
    name: string;
    year: string;
  };
  startDate: Date;
  endDate: Date;
  report: {
    name: string;
    /** Ausente na api anterior ao card 12. */
    lastName?: string;
    socialName: string;
    useSocialName: boolean;
    codEnrolled: string;
    whatsapp?: string;
    urgencyPhone?: string;
    totalClassRecords: number;
    studentRecords: number;
    presencePercentage: number;
  }[];
}