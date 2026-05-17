import { chatConversationRead } from "../urls";

export async function markRead(
  jwt: string,
  conversationId: string,
): Promise<void> {
  const res = await fetch(chatConversationRead(conversationId), {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) throw new Error("Falha ao marcar como lida");
}
