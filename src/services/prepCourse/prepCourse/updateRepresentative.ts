import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateRepresentative(
  token: string,
  id: string,
  representative: string
): Promise<void> {
  const url = new URL(`${partnerPrepCourse}/representative/${id}`);
  const res = await fetchWrapper(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ representative }),
  });
  if (res.status !== 200) {
    throw new Error("Erro ao atualizar representante");
  }
}
