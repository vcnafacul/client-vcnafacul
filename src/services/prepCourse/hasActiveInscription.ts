import fetchWrapper from "../../utils/fetchWrapper";
import { prepCourse } from "../urls";

interface HasActiveInscriptionResponse {
  hasActiveInscription: boolean;
  prepCourseName: string;
  inscription: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
  }
}

export async function hasActiveInscription(
  idPrepCourse: string,
  token: string
): Promise<HasActiveInscriptionResponse> {
  const response = await fetchWrapper(prepCourse(idPrepCourse), {
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
  return res as HasActiveInscriptionResponse;
}
