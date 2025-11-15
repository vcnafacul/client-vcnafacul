import fetchWrapper from "../../utils/fetchWrapper";
import { question_form } from "../urls";

export async function setQuestionActive(
  token: string,
  id: string
): Promise<void> {
  const response = await fetchWrapper(`${question_form}/${id}/set-active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
