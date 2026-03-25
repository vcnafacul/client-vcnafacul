import { periodJustification } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { PeriodJustification as PJType } from "@/types/partnerPrepCourse/periodJustification";

export async function getPeriodJustifications(
  token: string,
  page: number,
  limit: number,
  studentCourseId: string,
): Promise<Paginate<PJType>> {
  const url = new URL(periodJustification);
  const params: Record<string, string | number> = { page, limit, studentCourseId };
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

  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return {
    data: res.data,
    page: res.page,
    limit: res.limit,
    totalItems: res.totalItems,
  };
}
