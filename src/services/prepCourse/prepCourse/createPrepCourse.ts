import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

interface PrepCourseCreate {
  geoId: string;
  representative: string;
}

export async function createPrepCourse(
  token: string,
  prepCourse: PrepCourseCreate
): Promise<void> {
  const response = await fetchWrapper(partnerPrepCourse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prepCourse),
  });
  if (response.status !== 201) {
    throw new Error("Erro ao criar curso de preparação");
  }
}
