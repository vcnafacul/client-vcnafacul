import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

/** Envio de vídeo: o "upload" da demanda quando a lição é um vídeo do YouTube. */
export async function sendVideoDemand(id: string, url: string, token: string): Promise<boolean> {
  const response = await fetchWrapper(`${content}/${id}/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
  });
  if (response.status === 201 || response.status === 200) return true;
  const corpo = await response.json().catch(() => ({}));
  const mensagem = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
  throw new Error(mensagem || "Erro ao enviar o vídeo");
}
