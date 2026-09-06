import { coursePeriodYears } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getCoursePeriodYears(token: string): Promise<number[]> {
  const response = await fetchWrapper(coursePeriodYears, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error("Erro ao tentar recuperar os anos letivos");
}
