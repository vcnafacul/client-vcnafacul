
export interface AttendanceRecordItem {
  date: string,
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
    studentName: string;
    codEnrolled: string;
    totalClassRecords: number;
    studentRecords: number;
    presencePercentage: number;
  }[];
}