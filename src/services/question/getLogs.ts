import { AuditLog } from "@/types/auditLog/auditLog";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function getLogs(id: string, token: string): Promise<AuditLog[]> {
  const response = await fetchWrapper(`${questoes}/${id}/logs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    return await response.json();
  }
  throw new Error(`${response.status} - Erro ao buscar logs`);
}
