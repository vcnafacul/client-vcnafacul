import { coursePeriod } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function deleteCoursePeriod(
  token: string,
  id: string
): Promise<void> {
  const url = new URL(`${coursePeriod}/${id}`);

  const response = await fetchWrapper(url.toString(), {
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
    throw new Error("Erro ao tentar deletar período letivo");
  }
}
