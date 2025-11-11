import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function uploadImage(
  questionId: string,
  data: FormData,
  token: string
): Promise<string> {
  const response = await fetchWrapper(`${questoes}/${questionId}/uploadimage`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (response.status !== 200) {
    throw new Error("Erro ao tentar fazer upload da imagem!");
  }
  return await response.text();
}
