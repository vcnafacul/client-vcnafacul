import { useEffect } from "react";

/**
 * Atualiza o título da aba para refletir mensagens não lidas. Quando `unread > 0`,
 * prefixa `(N)`; quando vai a 0, restaura o título base (no mesmo lifecycle).
 */
export function useTabTitleUnread(
  unread: number,
  baseTitle = "Você na Facul",
): void {
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) ${baseTitle}` : baseTitle;
  }, [unread, baseTitle]);

  useEffect(() => {
    return () => {
      document.title = baseTitle;
    };
  }, [baseTitle]);
}
