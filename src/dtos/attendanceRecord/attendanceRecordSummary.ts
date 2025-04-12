
export interface AttendanceRecordItem {
  date: string,
  total: number
  presentCount: number
}
export interface AttendanceRecordSummary {
  class: {
    name: string;
    year: number;
  },
  startDate: Date;
  endDate: Date;
  classReport: AttendanceRecordItem[];
  generalReport: AttendanceRecordItem[];
}