import { AuditLog } from "../../types/auditLog/auditLog"
import fetchWrapper from "../../utils/fetchWrapper"
import { auditLogMs } from "../urls"

export async function getAauditLog(token: string, id: string) : Promise<AuditLog[]> {
    const response = await fetchWrapper(`${auditLogMs}/${id}`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        return await response.json()
    }
    throw new Error(`${response.status} - Erro ao buscar infos`)
}