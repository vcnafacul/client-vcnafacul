import { useEffect } from "react";

/**
 * Atualiza o título da aba do navegador refletindo a contagem de mensagens
 * não lidas. Quando `unread > 0`, prefixa `(N)` ao título base.
 *
 * Restaura o título base ao desmontar para evitar vazamento entre páginas.
 */
export function useTabTitleUnread(
  unread: number,
  baseTitle = "Você na Facul",
): void {
  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) ${baseTitle}` : baseTitle;
    return () => {
      document.title = baseTitle;
    };
  }, [unread, baseTitle]);
}
