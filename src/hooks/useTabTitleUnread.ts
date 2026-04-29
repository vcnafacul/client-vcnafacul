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
  // Apply the unread-prefixed title only when there's something to show,
  // so we don't blank the title between effect runs.
  useEffect(() => {
    if (unread > 0) {
      document.title = `(${unread}) ${baseTitle}`;
    }
  }, [unread, baseTitle]);

  // Restore the base title only on unmount.
  useEffect(() => {
    return () => {
      document.title = baseTitle;
    };
  }, [baseTitle]);
}
