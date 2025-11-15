import { coursePeriod } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { CoursePeriodEntity } from "./createCoursePeriod";

export async function getCoursePeriods(
  token: string,
  page: number = 1,
  limit: number = 5
): Promise<Paginate<CoursePeriodEntity>> {
  const url = new URL(coursePeriod);
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );

  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    const coursePeriods: Paginate<CoursePeriodEntity> = await response.json();
    return {
      data: coursePeriods.data,
      page,
      limit,
      totalItems: coursePeriods.totalItems,
    };
  }
  throw new Error(`Erro ao tentar recuperar periodos letivos - Pagina ${page}`);
}
