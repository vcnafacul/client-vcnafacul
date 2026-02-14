import { SyncReport } from "../../dtos/prova/syncReport";
import fetchWrapper from "../../utils/fetchWrapper";
import { prova } from "../urls";

export async function getSyncReport(token: string): Promise<SyncReport> {
    const response = await fetchWrapper(`${prova}/sync/report`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const res = await response.json();
    if (response.status !== 200) {
        throw new Error(res.message || "Erro ao buscar relatorio de sincronizacao");
    }
    return res;
}
