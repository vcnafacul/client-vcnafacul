import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuMessageSquare } from "react-icons/lu";
import { UnreadBadge } from "@/components/chat/UnreadBadge";
import { listenSupportInbox } from "@/services/firebase/conversations";
import { DASH, DASH_SUPPORT } from "@/routes/path";
import { useChatStore } from "@/store/chatStore";

/**
 * Badge global de mensagens não lidas no inbox de suporte.
 * Soma `unreadCountSupport` de todas as conversas abertas e renderiza
 * um link rápido para a inbox. Pensado para ser exibido apenas para
 * usuários com `Roles.supportAgent`.
 */
export function SupportInboxBadge() {
  const [count, setCount] = useState(0);
  const authed = useChatStore((s) => s.firebaseAuthed);

  useEffect(() => {
    if (!authed) return;
    return listenSupportInbox((convs) => {
      setCount(
        convs.reduce((acc, c) => acc + (c.unreadCountSupport ?? 0), 0),
      );
    });
  }, [authed]);

  return (
    <Link
      to={`${DASH}/${DASH_SUPPORT}`}
      className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted rounded-md transition"
      aria-label="Abrir inbox de suporte"
    >
      <LuMessageSquare className="h-4 w-4" />
      <span>Suporte</span>
      <UnreadBadge count={count} />
    </Link>
  );
}
