import fetchWrapper from "../../utils/fetchWrapper";
import { question_form } from "../urls";

export async function deleteQuestion(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${question_form}/${id}`, {
    method: "DELETE",
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
