import { Period } from "@/enums/analytics/period";
import { aggregateInscriptionCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { AggregateInscriptionCoursePeriod } from "./dtos/aggregate-inscription-course-period";

export async function aggregateInscriptionCourseByPeriod(
  period: Period,
  token: string,
): Promise<AggregateInscriptionCoursePeriod[]> {
  const response = await fetchWrapper(
    `${aggregateInscriptionCourse}?groupBy=${period}`,
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
