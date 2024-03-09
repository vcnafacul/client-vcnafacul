
import { AnswerSimulado } from "../../store/simulado";
import fetchWrapper from "../../utils/fetchWrapper";
import { answer } from "../urls";

export async function answerSimulado(data: AnswerSimulado, token: string) {
    const res = await fetchWrapper(answer, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if(res.status !== 204){
        throw new Error('Erro ao Responder Simulado')
    }
}