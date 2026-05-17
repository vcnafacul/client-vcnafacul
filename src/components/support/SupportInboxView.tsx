import type { ReactNode } from "react";
import { LuMessageSquareDashed, LuHeadset, LuSearch } from "react-icons/lu";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationListItem } from "@/pages/admin/support/ConversationListItem";
import type { ConversationDoc } from "@/services/firebase/conversations";

interface Props {
  title: string;
  convs: ConversationDoc[];
  sorted: ConversationDoc[];
  selected: ConversationDoc | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  userId: string | null;
  headerActions?: ReactNode;
}

export function SupportInboxView({
  title,
  convs,
  sorted,
  selected,
  selectedId,
  onSelect,
  onClose,
  search,
  onSearchChange,
  userId,
  headerActions,
}: Props) {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <header className="bg-marine text-white px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <LuHeadset className="h-5 w-5 text-orange" />
          <h1 className="font-raleway font-bold text-lg tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {headerActions}
          <span className="opacity-80">Conversas abertas</span>
          <span className="bg-orange text-white font-bold rounded-full min-w-[24px] h-6 inline-flex items-center justify-center px-2">
            {convs.length}
          </span>
        </div>
      </header>
      <div className="h-[3px] bg-custom-gradient" aria-hidden />
      <div className="flex flex-1 min-h-0">
        <aside className="max-w-96 border-r flex flex-col bg-backgroundGrey">
          <div className="p-3 border-b bg-white">
            <div className="relative">
              <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-grey" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {sorted.map((c) => (
              <ConversationListItem
                key={c.id}
                conv={c}
                selected={selectedId === c.id}
                onClick={() => onSelect(c.id)}
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
              subtitle={
                [selected.originLabel, selected.cursinhoName]
                  .filter(Boolean)
                  .join(" · ") || undefined
              }
              onClose={onClose}
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
    </div>
  );
}
