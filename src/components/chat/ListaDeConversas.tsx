import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nomeDoDestino } from "@/services/chat/conversasDoEstudante";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { formatMessageTimestamp } from "./formatMessageTimestamp";
import { UnreadBadge } from "./UnreadBadge";

interface Props {
  conversas: ConversationDoc[];
  onAbrir: (id: string) => void;
  onNova: () => void;
  /** Enquanto espera o cooldown do projeto, "Nova conversa" fica desligado. */
  novaDesabilitada?: boolean;
}

/**
 * A tela antes do chat, no balão do estudante (tickets/031, card 04): uma
 * linha por conversa — o projeto e cada cursinho. Abertas em cima, encerradas
 * (só leitura) embaixo; a ordem já vem de `conversasVisiveis`.
 */
export function ListaDeConversas({
  conversas,
  onAbrir,
  onNova,
  novaDesabilitada,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="font-semibold text-marine">Suas conversas</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={onNova}
          disabled={novaDesabilitada}
          className="gap-1"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Nova conversa
        </Button>
      </div>
      <ul className="flex-1 divide-y overflow-y-auto">
        {conversas.map((c) => {
          const quando = c.lastMessageAt?.toMillis?.();
          const encerrada = c.status === "closed";
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onAbrir(c.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-marine">
                      {nomeDoDestino(c)}
                    </span>
                    {encerrada && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                        Encerrada
                      </span>
                    )}
                  </div>
                  {c.lastMessageText && (
                    <p className="truncate text-sm text-gray-500">
                      {c.lastMessageText}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {quando ? (
                    <span className="text-[11px] text-gray-400">
                      {formatMessageTimestamp(new Date(quando))}
                    </span>
                  ) : null}
                  <UnreadBadge count={c.unreadCountStudent ?? 0} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
