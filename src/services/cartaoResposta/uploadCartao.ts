import { cartaoResposta } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

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

  if (response.status === 400) throw new Error("QR do cartão ilegível");
  /*
    ⚠️ **409: a mensagem do backend, quando houver.** Ela diz se o cartão já
    foi lido ou se FALHOU — e, falho, que o caminho é o "Reenviar" do relatório,
    não um envio novo.
  */
  if (response.status === 409) {
    const corpo = (await response.json().catch(() => ({}))) as { message?: unknown };
    throw new Error(
      typeof corpo.message === "string" && corpo.message
        ? corpo.message
        : "Cartão já enviado para este aluno",
    );
  }
  if (response.status === 502) throw new Error("Serviço de leitura (OMR) indisponível");
  if (response.status >= 400) throw new Error("Erro ao enviar o cartão");
  return response.json();
}
