
import { AnswerSimulado } from "../../store/simulado";
import { answer } from "../urls";

export async function answerSimulado(data: AnswerSimulado, token: string) {
    const res = await fetch(answer, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if(res.status !== 201){
        throw new Error('Erro ao Responder Simulado')
    }
}