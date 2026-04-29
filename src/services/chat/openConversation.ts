import { chatConversationOpen } from "../urls";

export interface ConversationMetadata {
  page: string;
  userAgent: string;
  device: "mobile" | "desktop";
  browser: string;
}

export async function openConversation(
  jwt: string,
  metadata: ConversationMetadata,
): Promise<{ id: string }> {
  const res = await fetch(chatConversationOpen, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ metadata }),
  });
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `Aguarde ${body.retryAfterSeconds ?? "alguns"} segundos para reabrir`,
    );
  }
  if (!res.ok) throw new Error("Falha ao abrir conversa");
  return res.json();
}
