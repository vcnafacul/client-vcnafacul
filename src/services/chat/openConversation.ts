import { chatConversationOpen } from "../urls";

export interface ConversationMetadata {
  page: string;
  userAgent: string;
  device: "mobile" | "desktop";
  browser: string;
}

interface InscriptionContext {
  inscriptionCourseId?: string;
  studentCourseId?: string;
}

export async function openConversation(
  jwt: string,
  metadata: ConversationMetadata,
  inscriptionContext?: InscriptionContext,
): Promise<{ id: string }> {
  const res = await fetch(chatConversationOpen, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ metadata, ...inscriptionContext }),
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
