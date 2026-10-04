import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/*
  Card 35: a tela mostra a mensagem do servidor. É ela que diferencia "não deu
  para ler o QR" de "QR de um simulado que não existe / de outro cursinho" e de
  "estudante de outro cursinho" — e, no 502, que o cartão JÁ FICOU registrado
  (tentar de novo dá "já foi enviado"; o caminho é o "Reenviar" do relatório).
  O texto fixo de cada status só aparece quando não vem corpo.
*/
const TEXTO_SEM_CORPO: Record<number, string> = {
  400: "Não foi possível ler o cartão. Tire outra foto, com o QR inteiro e nítido.",
  403: "Você não pode enviar este cartão.",
  409: "Cartão já enviado para este aluno",
  502: 'O leitor de cartões está fora do ar. O cartão foi registrado: use "Reenviar" no relatório do simulado quando o serviço voltar.',
};

async function mensagemDoServidor(response: Response): Promise<string | null> {
  const corpo = (await response.json().catch(() => ({}))) as { message?: unknown };
  return typeof corpo?.message === "string" && corpo.message ? corpo.message : null;
}

export async function uploadCartao(
  file: File,
  usuario: string,
  token: string,
): Promise<{ historicoId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("usuario", usuario);

  const response = await fetchWrapper(`${cartaoResposta}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // sem Content-Type → browser põe o multipart boundary
    body: formData,
  });

  if (response.status >= 400) {
    throw new Error(
      (await mensagemDoServidor(response)) ??
        TEXTO_SEM_CORPO[response.status] ??
        "Erro ao enviar o cartão",
    );
  }
  return response.json();
}
