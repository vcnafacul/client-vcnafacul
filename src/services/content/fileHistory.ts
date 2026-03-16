import { ContentFileHistoryDto } from "../../dtos/content/contentFileHistoryDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function getFileHistory(
  contentId: string,
  token: string
): Promise<ContentFileHistoryDto[]> {
  const response = await fetchWrapper(
    `${content}/${contentId}/file-history`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar historico de arquivos");
  }
  return res;
}
