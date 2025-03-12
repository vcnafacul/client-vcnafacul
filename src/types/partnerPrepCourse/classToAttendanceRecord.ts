export interface ClassToAttendanceRecord {
  id: string;
  name: string;
  year: number;
  students: StudentToAttendanceRecord[];
}

export interface StudentToAttendanceRecord {
  id: string;
  name: string;
  cod_enrolled: string;
}