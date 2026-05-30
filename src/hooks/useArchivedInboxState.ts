import { useEffect, useMemo, useState } from "react";
import {
  listenArchivedInbox,
  type ConversationDoc,
} from "@/services/firebase/conversations";
import { useChatStore } from "@/store/chatStore";

export function useArchivedInboxState(
  partnerPrepId: string | null,
  enabled: boolean,
) {
  const [convs, setConvs] = useState<ConversationDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const authed = useChatStore((s) => s.firebaseAuthed);

  useEffect(() => {
    if (!authed || !enabled) return;
    const unsub = listenArchivedInbox(setConvs, partnerPrepId);
    return unsub;
  }, [authed, enabled, partnerPrepId]);

  const sorted = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return [...convs]
      .filter((c) => !!c.lastMessageText)
      .filter((c) => !norm || c.userName.toLowerCase().includes(norm))
      .sort((a, b) => {
        const aTs =
          a.closedAt?.toMillis?.() ?? a.lastMessageAt?.toMillis?.() ?? 0;
        const bTs =
          b.closedAt?.toMillis?.() ?? b.lastMessageAt?.toMillis?.() ?? 0;
        return bTs - aTs;
      });
  }, [convs, search]);

  const selected = useMemo(
    () => convs.find((c) => c.id === selectedId) ?? null,
    [convs, selectedId],
  );

  return { convs, sorted, selected, selectedId, setSelectedId, search, setSearch };
}
