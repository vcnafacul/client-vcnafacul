import { create } from "zustand";
import type { ConversationDoc } from "@/services/firebase/conversations";

interface ChatState {
  firebaseAuthed: boolean;
  activeConversation: ConversationDoc | null;
  isOpen: boolean;
  isOpening: boolean;
  partnerPrepId: string | null;

  setFirebaseAuthed: (v: boolean) => void;
  setActiveConversation: (c: ConversationDoc | null) => void;
  setOpen: (v: boolean) => void;
  setOpening: (v: boolean) => void;
  setPartnerPrepId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  firebaseAuthed: false,
  activeConversation: null,
  isOpen: false,
  isOpening: false,
  partnerPrepId: null,
  setFirebaseAuthed: (v) => set({ firebaseAuthed: v }),
  setActiveConversation: (c) => set({ activeConversation: c }),
  setOpen: (v) => set({ isOpen: v }),
  setOpening: (v) => set({ isOpening: v }),
  setPartnerPrepId: (id) => set({ partnerPrepId: id }),
}));
