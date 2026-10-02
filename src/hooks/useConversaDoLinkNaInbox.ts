import { useEffect } from "react";
import { toast } from "react-toastify";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { useConversaDoLink } from "./useConversaDoLink";

type Lista = {
  carregado: boolean;
  convs: ConversationDoc[];
  setSelectedId: (id: string) => void;
};

/**
 * `?conversa=<id>` na inbox do suporte/colaborador (tickets/031, card 05):
 * seleciona nas ativas; se não estiver lá, liga as arquivadas e procura nelas.
 * Fora do alcance de quem abriu (outro cursinho, expirou) → aviso e nada.
 */
export function useConversaDoLinkNaInbox({
  ativas,
  arquivadas,
  arquivadasLigadas,
  ligarArquivadas,
  mostrarAba,
}: {
  ativas: Lista;
  arquivadas: Lista;
  arquivadasLigadas: boolean;
  ligarArquivadas: () => void;
  mostrarAba: (aba: "active" | "archived") => void;
}) {
  const { id, limpar } = useConversaDoLink();

  useEffect(() => {
    if (!id || !ativas.carregado) return;
    if (ativas.convs.some((c) => c.id === id)) {
      mostrarAba("active");
      ativas.setSelectedId(id);
      limpar();
      return;
    }
    if (!arquivadasLigadas) {
      ligarArquivadas();
      return;
    }
    if (!arquivadas.carregado) return;
    if (arquivadas.convs.some((c) => c.id === id)) {
      mostrarAba("archived");
      arquivadas.setSelectedId(id);
    } else {
      toast.info("Conversa não encontrada.");
    }
    limpar();
  }, [id, ativas, arquivadas, arquivadasLigadas, ligarArquivadas, mostrarAba, limpar]);
}
