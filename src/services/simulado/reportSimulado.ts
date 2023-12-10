
import { ReportDTO } from "../../dtos/audit/reportDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { report } from "../urls";

export async function reportSimulado(data: ReportDTO, token: string){
    const res = await fetchWrapper(report, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if(res.status !== 201){
        throw new Error('Erro ao Responder Simulado')
    }
}