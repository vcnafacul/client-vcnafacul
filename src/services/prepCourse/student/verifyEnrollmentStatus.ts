import { enrollmentStatus } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export enum EnrollmentPeriodStatus {
  NOT_STARTED = "NOT_STARTED", // Período ainda não começou
  IN_PROGRESS = "IN_PROGRESS", // Período em andamento
  FINISHED = "FINISHED", // Período finalizado
}

export interface VerifyEnrollmentStatusDtoOutput {
  isEnrolled: boolean;
  message: string;
  periodStatus?: EnrollmentPeriodStatus;
  courseInfo?: {
    name: string;
    startDate: Date;
    endDate: Date;
  };
}

export async function verifyEnrollmentStatus(
  cpf: string,
  enrollmentCode: string,
  token: string
): Promise<VerifyEnrollmentStatusDtoOutput> {
  const response = await fetchWrapper(enrollmentStatus, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cpf, enrollmentCode }),
  });

  if(response.status !== 200) {
    const res = await response.json();
    throw new Error(res.message);
  }

  return await response.json();
}
