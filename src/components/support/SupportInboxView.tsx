import type { ReactNode } from "react";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { LuMessageSquareDashed, LuHeadset, LuSearch } from "react-icons/lu";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationListItem } from "@/pages/admin/support/ConversationListItem";
import { cn } from "@/lib/utils";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { SEM_CURSINHO } from "./semCursinho";

type Tab = "active" | "archived";

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
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  archivedCount: number;
  /** Inbox do admin: destaca o cursinho de cada conversa (lista e cabeçalho). */
  showCursinho?: boolean;
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
  activeTab,
  onTabChange,
  archivedCount,
  showCursinho = false,
}: Props) {
  const isArchived = activeTab === "archived";
  /*
    Abaixo de 768px (o `sm` do projeto) uma coisa de cada vez: a lista, ou a
    conversa em tela cheia com ← para voltar. Lado a lado não cabia.
  */
  const acimaDeSm = useAcimaDeSm();
  const conversaAberta = !!(selected && userId);
  const mostrarLista = acimaDeSm || !conversaAberta;
  const mostrarConversa = acimaDeSm || conversaAberta;

  return (
    // `dvh` desconta a barra do navegador no celular; sem suporte, cai no vh.
    <div className="flex flex-col h-[calc(100vh-76px)] supports-[height:100dvh]:h-[calc(100dvh-76px)]">
      <header className="bg-marine text-white px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <LuHeadset className="h-5 w-5 text-orange" />
          <h1 className="font-raleway font-bold text-lg tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {headerActions}
          <span className="opacity-80">
            {isArchived ? "Arquivadas" : "Conversas abertas"}
          </span>
          <span className="bg-orange text-white font-bold rounded-full min-w-[24px] h-6 inline-flex items-center justify-center px-2">
            {convs.length}
          </span>
        </div>
      </header>
      <div className="h-[3px] bg-custom-gradient" aria-hidden />
      <div className="flex flex-1 min-h-0">
        {mostrarLista && (
        <aside className="w-full sm:w-auto sm:max-w-96 border-r flex flex-col bg-backgroundGrey">
          <div className="flex border-b bg-white shrink-0">
            <button
              type="button"
              onClick={() => onTabChange("active")}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2",
                !isArchived
                  ? "border-orange text-marine"
                  : "border-transparent text-grey hover:text-marine",
              )}
            >
              Ativas
            </button>
            <button
              type="button"
              onClick={() => onTabChange("archived")}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5",
                isArchived
                  ? "border-orange text-marine"
                  : "border-transparent text-grey hover:text-marine",
              )}
            >
              Arquivadas
              {archivedCount > 0 && (
                <span className="bg-grey/20 text-grey rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 text-[10px] font-bold">
                  {archivedCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 h-11 border-b bg-white shrink-0">
            <LuSearch className="h-4 w-4 text-grey shrink-0" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome..."
              className="flex-1 border-none shadow-none bg-transparent px-0 h-full text-sm focus-visible:ring-0 placeholder:text-grey"
            />
          </div>
          <ScrollArea className="flex-1">
            {sorted.map((c) => (
              <ConversationListItem
                key={c.id}
                conv={c}
                selected={selectedId === c.id}
                onClick={() => onSelect(c.id)}
                showCursinho={showCursinho}
              />
            ))}
            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
                <LuMessageSquareDashed className="h-12 w-12 text-marine/30" />
                <span className="font-medium text-marine">
                  {convs.length === 0
                    ? isArchived
                      ? "Nenhuma conversa arquivada"
                      : "Nenhuma conversa aberta"
                    : "Nenhum resultado"}
                </span>
                <span className="text-xs text-grey">
                  {convs.length === 0
                    ? isArchived
                      ? "As conversas encerradas aparecerão aqui."
                      : "Quando um estudante pedir ajuda, aparecerá aqui."
                    : "Ajuste o filtro ou a busca."}
                </span>
              </div>
            )}
          </ScrollArea>
        </aside>
        )}
        {mostrarConversa && (
        <main className="flex-1 min-w-0 bg-white">
          {selected && userId ? (
            <ChatLayout
              conversationId={selected.id}
              currentUserId={userId}
              className="rounded-none"
              title={selected.userName}
              subtitle={
                (showCursinho
                  ? selected.originLabel
                  : [selected.originLabel, selected.cursinhoName]
                      .filter(Boolean)
                      .join(" · ")) || undefined
              }
              cursinhoLine={
                showCursinho
                  ? selected.cursinhoName || SEM_CURSINHO
                  : undefined
              }
              cursinhoMissing={showCursinho && !selected.cursinhoName}
              onClose={onClose}
              onBack={acimaDeSm ? undefined : onClose}
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
                {isArchived
                  ? "Escolha uma conversa arquivada para visualizar o histórico."
                  : "Escolha uma conversa na lista ao lado para começar a atender."}
              </span>
            </div>
          )}
        </main>
        )}
      </div>
    </div>
  );
}
