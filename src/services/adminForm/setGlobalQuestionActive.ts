import fetchWrapper from "@/utils/fetchWrapper";
import { admin_question_form } from "../urls";

export async function setGlobalQuestionActive(
  token: string,
  id: string
): Promise<void> {
  const response = await fetchWrapper(
    `${admin_question_form}/${id}/set-active`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw res;
    }
  }
}
