import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** O parâmetro que abre uma conversa: `?conversa=<id>` (tickets/031, card 05). */
export const PARAMETRO_CONVERSA = "conversa";

/**
 * Lê o `?conversa=<id>` do endereço. `limpar` tira o parâmetro sem criar
 * entrada no histórico — o "voltar" do navegador não reabre a conversa.
 */
export function useConversaDoLink() {
  const [params, setParams] = useSearchParams();
  const id = params.get(PARAMETRO_CONVERSA);
  const limpar = useCallback(() => {
    setParams(
      (atual) => {
        const novo = new URLSearchParams(atual);
        novo.delete(PARAMETRO_CONVERSA);
        return novo;
      },
      { replace: true },
    );
  }, [setParams]);
  return { id, limpar };
}
