import { useEffect, useMemo, useRef, useState } from "react";
import { useTabTitleUnread } from "@/hooks/useTabTitleUnread";
import { markRead } from "@/services/chat/markRead";
import {
  listenSupportInbox,
  type ConversationDoc,
} from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";

export function useSupportInboxState(partnerPrepId: string | null) {
  const [convs, setConvs] = useState<ConversationDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const jwt = useAuthStore((s) => s.data.token);
  const authed = useChatStore((s) => s.firebaseAuthed);
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    if (!authed) return;
    const unsub = listenSupportInbox(setConvs, partnerPrepId);
    return unsub;
  }, [authed, partnerPrepId]);

  const totalUnread = useMemo(
    () => convs.reduce((acc, c) => acc + (c.unreadCountSupport ?? 0), 0),
    [convs],
  );

  const sorted = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return [...convs]
      .filter((c) => !norm || c.userName.toLowerCase().includes(norm))
      .sort((a, b) => {
        const aUn = (a.unreadCountSupport ?? 0) > 0 ? 1 : 0;
        const bUn = (b.unreadCountSupport ?? 0) > 0 ? 1 : 0;
        if (aUn !== bUn) return bUn - aUn;
        const aTs = a.lastMessageAt?.toMillis?.() ?? 0;
        const bTs = b.lastMessageAt?.toMillis?.() ?? 0;
        return bTs - aTs;
      });
  }, [convs, search]);

  const selected = useMemo(
    () => convs.find((c) => c.id === selectedId) ?? null,
    [convs, selectedId],
  );

  useEffect(() => {
    if (autoSelectedRef.current || selectedId) return;
    const firstUnread = convs.find((c) => (c.unreadCountSupport ?? 0) > 0);
    if (firstUnread) {
      setSelectedId(firstUnread.id);
      autoSelectedRef.current = true;
    }
  }, [convs, selectedId]);

  useTabTitleUnread(totalUnread);

  useEffect(() => {
    if (!jwt || !selected) return;
    if ((selected.unreadCountSupport ?? 0) > 0) {
      markRead(jwt, selected.id).catch(() => {});
    }
  }, [selected, jwt]);

  return { convs, sorted, selected, selectedId, setSelectedId, search, setSearch };
}
