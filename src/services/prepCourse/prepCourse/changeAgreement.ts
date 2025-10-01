import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function changeAgreement(
  token: string,
  id: string,
  agreement: File
): Promise<string> {
  const url = new URL(`${partnerPrepCourse}/agreement/${id}`);

  const formData = new FormData();
  formData.append("agreement", agreement);
  const res = await fetchWrapper(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (res.status !== 201) {
    throw new Error("Erro ao atualizar o contrato");
  }

  return await res.text();
}

export default changeAgreement;
