import { create } from "zustand";
import type { ConversationDoc } from "@/services/firebase/conversations";
import type { MessageDoc } from "@/services/firebase/messages";

interface ChatState {
  firebaseAuthed: boolean;
  activeConversation: ConversationDoc | null;
  messages: MessageDoc[];
  isOpen: boolean;
  isOpening: boolean;

  setFirebaseAuthed: (v: boolean) => void;
  setActiveConversation: (c: ConversationDoc | null) => void;
  setMessages: (m: MessageDoc[]) => void;
  setOpen: (v: boolean) => void;
  setOpening: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  firebaseAuthed: false,
  activeConversation: null,
  messages: [],
  isOpen: false,
  isOpening: false,
  setFirebaseAuthed: (v) => set({ firebaseAuthed: v }),
  setActiveConversation: (c) => set({ activeConversation: c }),
  setMessages: (m) => set({ messages: m }),
  setOpen: (v) => set({ isOpen: v }),
  setOpening: (v) => set({ isOpening: v }),
}));
