
export interface AttendanceRecord {
  id: string;
  classId: string;
  registeredAt: Date;
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
}

export interface AttendanceRecordByStudent {
  id: string;
  registeredAt: Date;
  present: string;
  justification?: string;
  className: string;
}


