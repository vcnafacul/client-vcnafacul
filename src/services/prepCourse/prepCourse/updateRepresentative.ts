import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateRepresentative(
  token: string,
  id: string,
  representative: string,
  force: boolean = false
): Promise<void> {
  const url = new URL(`${partnerPrepCourse}/representative/${id}`);
  const res = await fetchWrapper(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ representative, force }),
  });
  if (res.status === 409) {
    const r = await res.json();
    throw new Error(r.message);
  }
  if (res.status !== 200) {
    throw new Error("Erro ao atualizar representante");
  }
}
