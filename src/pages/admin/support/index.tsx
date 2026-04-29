import { useEffect, useMemo, useState } from "react";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/context/ChatProvider";
import { markRead } from "@/services/chat/markRead";
import {
  listenSupportInbox,
  type ConversationDoc,
} from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { ConversationListItem } from "./ConversationListItem";

export default function AdminSupportPage() {
  const [convs, setConvs] = useState<ConversationDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const jwt = useAuthStore((s) => s.data.token);
  const { userId } = useChatContext();

  useEffect(() => {
    const unsub = listenSupportInbox(setConvs);
    return unsub;
  }, []);

  const selected = useMemo(
    () => convs.find((c) => c.id === selectedId) ?? null,
    [convs, selectedId],
  );

  useEffect(() => {
    if (!jwt || !selected) return;
    if ((selected.unreadCountSupport ?? 0) > 0) {
      markRead(jwt, selected.id).catch(() => {});
    }
  }, [selected, jwt]);

  return (
    <div className="flex h-[calc(100vh-100px)]">
      <aside className="w-72 border-r flex flex-col">
        <div className="p-3 font-semibold border-b">
          Conversas abertas ({convs.length})
        </div>
        <ScrollArea className="flex-1">
          {convs.map((c) => (
            <ConversationListItem
              key={c.id}
              conv={c}
              selected={selectedId === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
          {convs.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              Nenhuma conversa aberta
            </div>
          )}
        </ScrollArea>
      </aside>
      <main className="flex-1">
        {selected && userId ? (
          <ChatLayout
            conversationId={selected.id}
            currentUserId={userId}
            title={`Suporte — ${selected.userName}`}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Selecione uma conversa
          </div>
        )}
      </main>
    </div>
  );
}
