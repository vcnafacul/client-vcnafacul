import fetchWrapper from "@/utils/fetchWrapper";
import { admin_section_form } from "../urls";

export async function reorderGlobalQuestions(
  token: string,
  sectionId: string,
  questionIds: string[]
): Promise<void> {
  const response = await fetchWrapper(
    `${admin_section_form}/${sectionId}/reorder`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionIds }),
    }
  );

  if (response.status !== 200) {
    const res = await response.json();
    if (response.status >= 400) {
      throw new Error(res.message || "Erro ao reordenar questões");
    }
  }
}
