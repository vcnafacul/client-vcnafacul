
export interface AttendanceRecordHistory {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  registeredAt: Date;
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
  registeredBy: string;
}
