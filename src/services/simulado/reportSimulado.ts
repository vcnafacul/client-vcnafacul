
import { ReportDTO } from "../../dtos/audit/reportDto";
import { report } from "../urls";

export async function reportSimulado(data: ReportDTO, token: string){
    console.log(data)
    const res = await fetch(report, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    console.log(await res.json())
    if(res.status !== 201){
        throw new Error('Erro ao Responder Simulado')
    }
}