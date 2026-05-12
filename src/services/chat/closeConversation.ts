import { chatConversationClose } from "../urls";

export async function closeConversation(
  jwt: string,
  conversationId: string,
): Promise<void> {
  const res = await fetch(chatConversationClose(conversationId), {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) throw new Error("Falha ao encerrar conversa");
}
