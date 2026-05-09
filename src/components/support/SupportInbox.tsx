import { useEffect, useMemo, useRef, useState } from "react";
import { LuMessageSquareDashed, LuHeadset, LuSearch } from "react-icons/lu";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/context/ChatProvider";
import { useTabTitleUnread } from "@/hooks/useTabTitleUnread";
import { markRead } from "@/services/chat/markRead";
import {
  listenSupportInbox,
  type ConversationDoc,
} from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";
import { ConversationListItem } from "@/pages/admin/support/ConversationListItem";
import { InitiateConversationDialog } from "@/pages/admin/support/InitiateConversationDialog";

type FilterTab = "unread" | "all";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

function FilterButton({ active, onClick, label, count }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 text-xs font-semibold py-1.5 rounded-md transition flex items-center justify-center gap-1.5",
        active
          ? "bg-marine text-white shadow-sm"
          : "text-darkGrey hover:bg-white",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
          active ? "bg-orange text-white" : "bg-lightGray text-darkGrey",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function SupportInbox() {
  const [convs, setConvs] = useState<ConversationDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("unread");
  const [search, setSearch] = useState("");
  const [initiateOpen, setInitiateOpen] = useState(false);
  const jwt = useAuthStore((s) => s.data.token);
  const { userId } = useChatContext();
  const authed = useChatStore((s) => s.firebaseAuthed);
  const partnerPrepId = useChatStore((s) => s.partnerPrepId);
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
  const unreadCount = useMemo(
    () => convs.filter((c) => (c.unreadCountSupport ?? 0) > 0).length,
    [convs],
  );

  const sorted = useMemo(() => {
    const norm = search.trim().toLowerCase();
    return [...convs]
      .filter((c) => {
        if (tab === "unread" && (c.unreadCountSupport ?? 0) === 0) return false;
        if (norm && !c.userName.toLowerCase().includes(norm)) return false;
        return true;
      })
      .sort((a, b) => {
        const aUn = (a.unreadCountSupport ?? 0) > 0 ? 1 : 0;
        const bUn = (b.unreadCountSupport ?? 0) > 0 ? 1 : 0;
        if (aUn !== bUn) return bUn - aUn;
        const aTs = a.lastMessageAt?.toMillis?.() ?? 0;
        const bTs = b.lastMessageAt?.toMillis?.() ?? 0;
        return bTs - aTs;
      });
  }, [convs, tab, search]);

  const selected = useMemo(
    () => convs.find((c) => c.id === selectedId) ?? null,
    [convs, selectedId],
  );

  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (selectedId) return;
    const firstUnread = convs.find(
      (c) => (c.unreadCountSupport ?? 0) > 0,
    );
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

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <header className="bg-marine text-white px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <LuHeadset className="h-5 w-5 text-orange" />
          <h1 className="font-raleway font-bold text-lg tracking-tight">
            Suporte
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {!partnerPrepId && (
            <Button
              type="button"
              onClick={() => setInitiateOpen(true)}
              className="bg-white text-marine hover:bg-white/90 h-8 px-3 text-xs font-semibold"
            >
              Iniciar conversa
            </Button>
          )}
          <span className="opacity-80">Conversas abertas</span>
          <span className="bg-orange text-white font-bold rounded-full min-w-[24px] h-6 inline-flex items-center justify-center px-2">
            {convs.length}
          </span>
        </div>
      </header>
      <div className="h-[3px] bg-custom-gradient" aria-hidden />
      <div className="flex flex-1 min-h-0">
        <aside className="w-80 border-r flex flex-col bg-backgroundGrey">
          <div className="p-3 border-b bg-white space-y-2">
            <div className="relative">
              <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-grey" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex gap-1 bg-backgroundGrey rounded-md p-0.5">
              <FilterButton
                active={tab === "unread"}
                onClick={() => setTab("unread")}
                label="Não lidas"
                count={unreadCount}
              />
              <FilterButton
                active={tab === "all"}
                onClick={() => setTab("all")}
                label="Todas"
                count={convs.length}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {sorted.map((c) => (
              <ConversationListItem
                key={c.id}
                conv={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
                <LuMessageSquareDashed className="h-12 w-12 text-marine/30" />
                <span className="font-medium text-marine">
                  {convs.length === 0
                    ? "Nenhuma conversa aberta"
                    : "Nenhum resultado"}
                </span>
                <span className="text-xs text-grey">
                  {convs.length === 0
                    ? "Quando um estudante pedir ajuda, aparecerá aqui."
                    : "Ajuste o filtro ou a busca."}
                </span>
              </div>
            )}
          </ScrollArea>
        </aside>
        <main className="flex-1 bg-white">
          {selected && userId ? (
            <ChatLayout
              conversationId={selected.id}
              currentUserId={userId}
              title={selected.userName}
              onClose={() => setSelectedId(null)}
              showAvatar
              avatarSeed={selected.userId ?? selected.userName}
              status={selected.status}
              originPage={selected.metadata?.page}
              device={selected.metadata?.device}
              browser={selected.metadata?.browser}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <LuHeadset className="h-14 w-14 text-marine/20" />
              <span className="font-raleway font-semibold text-marine">
                Selecione uma conversa
              </span>
              <span className="text-sm text-grey max-w-xs">
                Escolha uma conversa na lista ao lado para começar a atender.
              </span>
            </div>
          )}
        </main>
      </div>
      {!partnerPrepId && (
        <InitiateConversationDialog
          open={initiateOpen}
          onOpenChange={setInitiateOpen}
          onCreated={(id) => setSelectedId(id)}
        />
      )}
    </div>
  );
}
