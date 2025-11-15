import { coursePeriod } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { CoursePeriodOutput } from "./createCoursePeriod";

export async function updateCoursePeriod(
  token: string,
  entity: CoursePeriodOutput & { id: string }
): Promise<void> {
  const response = await fetchWrapper(coursePeriod, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entity),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 200) {
    throw new Error("Erro ao tentar editar período letivo");
  }
}
