import fetchWrapper from "../../utils/fetchWrapper";
import { prepCourse } from "../urls";

export async function hasActiveInscription(
  idPrepCourse: string,
  token: string
): Promise<boolean> {
  const response = await fetchWrapper(prepCourse(idPrepCourse), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await response.json();
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
  }
  return res;
}
