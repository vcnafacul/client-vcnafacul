import { Period } from "@/enums/analytics/period";
import { aggregateStudentCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateStudentCoursePeriod } from "./dtos/aggregate-student-course-period";

export async function aggregateStudentCourseByPeriod(
  period: Period,
  token: string,
): Promise<AggregateStudentCoursePeriod[]> {
  const response = await fetchWrapper(
    `${aggregateStudentCourse}?groupBy=${period}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de cursinhos`);
  }

  return res;
}
