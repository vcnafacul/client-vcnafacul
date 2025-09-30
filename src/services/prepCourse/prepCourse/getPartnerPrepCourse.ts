import { partnerPrepCourse } from "@/services/urls";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getPartnerPrepCourse(
  token: string,
  page: number = 1,
  limit: number = 100
): Promise<Paginate<PartnerPrepCourse>> {
  const url = new URL(partnerPrepCourse);
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );
  const res = await fetchWrapper(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    return {
      data: [] as PartnerPrepCourse[],
      page: 1,
      limit: 0,
      totalItems: 0,
    };
  }

  return await res.json();
}

export default getPartnerPrepCourse;
