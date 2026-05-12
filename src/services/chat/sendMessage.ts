import { chatMessage } from "../urls";

export async function sendMessage(
  jwt: string,
  conversationId: string,
  content: string,
): Promise<{ id: string }> {
  if (content.length < 1) throw new Error("Mensagem vazia");
  if (content.length > 1000)
    throw new Error("Mensagem maior que 1000 caracteres");
  const res = await fetch(chatMessage, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ conversationId, content }),
  });
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Aguarde ${body.retryAfterSeconds ?? "alguns"} segundos antes de enviar novamente`,
    );
  }
  if (!res.ok) throw new Error("Falha ao enviar");
  return res.json();
}
