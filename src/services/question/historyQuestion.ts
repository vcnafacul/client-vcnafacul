import { HistoryQuestion } from "../../types/question/historyQuestion";
import fetchWrapper from "../../utils/fetchWrapper";
import { historyQuestion } from "../urls";

export async function getHistoryQuestion(
  token: string,
  id: string
): Promise<HistoryQuestion> {
  const response = await fetchWrapper(`${historyQuestion}/${id}`,  {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
})
if(response.status === 200) {
    return await response.json()
}
throw new Error(`${response.status} - Erro ao buscar infos`)
}
