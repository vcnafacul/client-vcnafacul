import { partnerPrepCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function changeLogo(
  token: string,
  id: string,
  logo: File
): Promise<string> {
  const url = new URL(`${partnerPrepCourse}/logo/${id}`);

  const formData = new FormData();
  formData.append("logo", logo);
  console.log("Enviando...");
  const res = await fetchWrapper(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  console.log(res);
  if (res.status !== 201) {
    throw new Error("Erro ao atualizar o logo");
  }

  return await res.text();
}

export default changeLogo;
