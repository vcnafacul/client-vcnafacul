import { inscriptionCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function extendInscription(
  token: string,
  inscriptionId: string,
  endDate: Date
): Promise<void> {
  const response = await fetchWrapper(
    `${inscriptionCourse}/${inscriptionId}/extend`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endDate }),
    }
  );
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 200) {
    throw new Error("Erro ao tentar prorrogar processo seletivo");
  }
}
