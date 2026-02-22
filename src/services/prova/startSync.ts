import fetchWrapper from "../../utils/fetchWrapper";
import { prova } from "../urls";

export async function startSync(token: string): Promise<{ status: string; message: string }> {
    const response = await fetchWrapper(`${prova}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const res = await response.json();
    if (response.status !== 202) {
        throw new Error(res.message || "Erro ao iniciar sincronizacao");
    }
    return res;
}
