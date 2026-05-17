import { chatConversationsInitiate } from "../urls";

export async function initiateConversation(
  jwt: string,
  targetUserId: string,
  content: string,
): Promise<{ conversationId: string; messageId: string }> {
  const res = await fetch(chatConversationsInitiate, {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUserId, content }),
  });
  if (!res.ok) {
    let msg = "Falha ao iniciar conversa";
    try {
      const body = await res.json();
      if (typeof body?.message === "string") msg = body.message;
      else if (Array.isArray(body?.message)) msg = body.message.join(", ");
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}
