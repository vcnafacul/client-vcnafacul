export enum AttendancePeriod {
  MANHA = "MANHA",
  TARDE = "TARDE",
  NOITE = "NOITE",
}

export const attendancePeriodLabel: Record<AttendancePeriod, string> = {
  [AttendancePeriod.MANHA]: "Manhã",
  [AttendancePeriod.TARDE]: "Tarde",
  [AttendancePeriod.NOITE]: "Noite",
};
