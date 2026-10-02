import { beforeEach, describe, expect, it } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { useChatStore } from "./chatStore";

const conversa = (id: string, status: "open" | "closed" = "open") =>
  ({ id, status, unreadCountStudent: 0, unreadCountSupport: 0 }) as ConversationDoc;

beforeEach(() => useChatStore.getState().resetConversations());

describe("chatStore — várias conversas (tickets/031, card 03)", () => {
  it("a ativa é a aberta mais recente quando nada foi selecionado", () => {
    useChatStore.getState().setConversations([conversa("a"), conversa("b")]);
    expect(useChatStore.getState().activeConversation?.id).toBe("a");
  });

  it("a selecionada vira a ativa, e continua ao chegar lista nova", () => {
    const { setConversations, selectConversation } = useChatStore.getState();
    setConversations([conversa("a"), conversa("b")]);
    selectConversation("b");
    expect(useChatStore.getState().activeConversation?.id).toBe("b");

    setConversations([conversa("a"), conversa("b"), conversa("c")]);
    expect(useChatStore.getState().activeConversation?.id).toBe("b");
  });

  it("a selecionada encerrou → ativa vira null se não há outra aberta", () => {
    const { setConversations, selectConversation } = useChatStore.getState();
    setConversations([conversa("a")]);
    selectConversation("a");
    setConversations([conversa("a", "closed")]);
    expect(useChatStore.getState().activeConversation).toBeNull();
  });

  it("reset limpa tudo (logout)", () => {
    useChatStore.getState().setConversations([conversa("a")]);
    useChatStore.getState().resetConversations();
    const s = useChatStore.getState();
    expect(s.conversations).toEqual([]);
    expect(s.activeConversation).toBeNull();
  });
});
