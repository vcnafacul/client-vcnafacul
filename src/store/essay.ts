import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface EssayDraftState {
  draftId: string | null;
  themeId: string | null;
  title: string;
  text: string;
  setDraft: (themeId: string, title: string, text: string, draftId?: string) => void;
  updateText: (text: string) => void;
  updateTitle: (title: string) => void;
  setDraftId: (id: string) => void;
  clearDraft: () => void;
}

export const useEssayStore = create<EssayDraftState>()(
  persist(
    (set) => ({
      draftId: null,
      themeId: null,
      title: "",
      text: "",
      setDraft: (themeId, title, text, draftId) =>
        set({ themeId, title, text, draftId: draftId ?? null }),
      updateText: (text) => set({ text }),
      updateTitle: (title) => set({ title }),
      setDraftId: (draftId) => set({ draftId }),
      clearDraft: () =>
        set({ draftId: null, themeId: null, title: "", text: "" }),
    }),
    {
      name: "essay-draft-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
