import { coursePeriod } from "@/services/urls";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import fetchWrapper from "@/utils/fetchWrapper";

export interface CoursePeriodOutput {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface CoursePeriodEntity extends CoursePeriodOutput {
  id: string;
  year: number;
  partnerPrepCourseId: string;
  classesCount: number;
  createdAt: Date;
  updatedAt: Date;
  classes: ClassEntity[];
}

export async function createCoursePeriod(
  token: string,
  dto: CoursePeriodOutput
): Promise<CoursePeriodEntity> {
  const response = await fetchWrapper(coursePeriod, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 201) {
    throw new Error("Erro ao tentar criar periodo letivo");
  }
  return await response.json();
}
