import { create } from "zustand";
import type { ConversationDoc } from "@/services/firebase/conversations";

/**
 * A conversa "ativa" enquanto a tela só mostra uma (até o card 04): a
 * selecionada, se ainda estiver aberta; senão a aberta mais recente.
 */
function ativaEntre(
  conversas: ConversationDoc[],
  selecionada: string | null,
): ConversationDoc | null {
  const abertas = conversas.filter((c) => c.status === "open");
  return abertas.find((c) => c.id === selecionada) ?? abertas[0] ?? null;
}

interface ChatState {
  firebaseAuthed: boolean;
  /**
   * Estudante (tickets/031, card 03): todas as conversas visíveis — abertas e
   * encerradas há até 7 dias, já ordenadas (`conversasVisiveis`). Uma aberta
   * por destino (projeto ou cada cursinho).
   */
  conversations: ConversationDoc[];
  /** A 1ª lista chegou do Firestore (o `?conversa=` só decide depois). */
  conversationsLoaded: boolean;
  selectedConversationId: string | null;
  /** Derivada de `conversations` + `selectedConversationId`. */
  activeConversation: ConversationDoc | null;
  /**
   * Suporte/colaborador (tickets/031, card 06): as conversas abertas da inbox
   * dele, para o sino. Quem preenche é o `SupportNotifier` (o listener já
   * existia lá — evita um segundo).
   */
  inboxDoSuporte: ConversationDoc[];
  /** A inbox é a do cursinho (`/dashboard/suporte-cursinho`), não a do projeto. */
  inboxDoCursinho: boolean;
  isOpen: boolean;
  isOpening: boolean;
  partnerPrepId: string | null;
  cooldownUntil: number | null;

  setFirebaseAuthed: (v: boolean) => void;
  setConversations: (c: ConversationDoc[]) => void;
  selectConversation: (id: string | null) => void;
  setInboxDoSuporte: (c: ConversationDoc[], doCursinho: boolean) => void;
  setOpen: (v: boolean) => void;
  setOpening: (v: boolean) => void;
  setPartnerPrepId: (id: string | null) => void;
  setCooldownUntil: (v: number | null) => void;
  /** Logout / troca de conta. */
  resetConversations: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  firebaseAuthed: false,
  conversations: [],
  conversationsLoaded: false,
  selectedConversationId: null,
  activeConversation: null,
  inboxDoSuporte: [],
  inboxDoCursinho: false,
  isOpen: false,
  isOpening: false,
  partnerPrepId: null,
  cooldownUntil: null,
  setFirebaseAuthed: (v) => set({ firebaseAuthed: v }),
  setConversations: (conversations) =>
    set((s) => ({
      conversations,
      conversationsLoaded: true,
      activeConversation: ativaEntre(conversations, s.selectedConversationId),
    })),
  selectConversation: (id) =>
    set((s) => ({
      selectedConversationId: id,
      activeConversation: ativaEntre(s.conversations, id),
    })),
  setInboxDoSuporte: (inboxDoSuporte, inboxDoCursinho) =>
    set({ inboxDoSuporte, inboxDoCursinho }),
  setOpen: (v) => set({ isOpen: v }),
  setOpening: (v) => set({ isOpening: v }),
  setPartnerPrepId: (id) => set({ partnerPrepId: id }),
  setCooldownUntil: (v) => set({ cooldownUntil: v }),
  resetConversations: () =>
    set({
      conversations: [],
      conversationsLoaded: false,
      selectedConversationId: null,
      activeConversation: null,
      cooldownUntil: null,
    }),
}));
