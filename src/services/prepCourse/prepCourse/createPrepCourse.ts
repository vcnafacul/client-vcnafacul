import { partnerPrepCourse } from "@/services/urls";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import fetchWrapper from "@/utils/fetchWrapper";

interface PrepCourseCreate {
  geoId: string;
  representative: string;
}

export async function createPrepCourse(
  token: string,
  prepCourse: PrepCourseCreate,
  force: boolean = false
): Promise<PartnerPrepCourse> {
  const response = await fetchWrapper(partnerPrepCourse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...prepCourse, force }),
  });
  if (response.status === 409) {
    const r = await response.json();
    throw new Error(r.message);
  }
  if (response.status !== 201) {
    throw new Error("Erro ao criar curso de preparação");
  }

  const prep = await response.json();
  console.log(prep);
  return prep;
}
