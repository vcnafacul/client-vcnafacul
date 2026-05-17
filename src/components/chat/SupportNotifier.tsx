import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useChatContext } from "@/context/ChatProvider";
import { useTabTitleUnread } from "@/hooks/useTabTitleUnread";
import { DASH, DASH_SUPPORT } from "@/routes/path";
import { getMyPartnerPrepId } from "@/services/chat/getMyPartnerPrepId";
import {
  listenSupportInbox,
  type ConversationDoc,
} from "@/services/firebase/conversations";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";

const INBOX_PATH = `${DASH}/${DASH_SUPPORT}`;

export function SupportNotifier() {
  const { role } = useChatContext();
  const authed = useChatStore((s) => s.firebaseAuthed);
  const jwt = useAuthStore((s) => s.data.token);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [total, setTotal] = useState(0);
  const prevTotalRef = useRef<number | null>(null);
  const pathnameRef = useRef(pathname);

  // undefined = ainda buscando; null = admin global (sem filtro); string = cursinho específico
  const [resolvedPartnerPrepId, setResolvedPartnerPrepId] = useState<
    string | null | undefined
  >(undefined);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useTabTitleUnread(role === "support_agent" ? total : 0);

  // Resolve o partnerPrepId real via API — o token Firebase não é confiável para
  // agentes de cursinho pois o claim supportAgent sobrescreve o partnerPrepId.
  useEffect(() => {
    if (role !== "support_agent" || !authed || !jwt) return;
    getMyPartnerPrepId(jwt)
      .then((id) => setResolvedPartnerPrepId(id))
      .catch(() => setResolvedPartnerPrepId(null));
  }, [role, authed, jwt]);

  useEffect(() => {
    if (role !== "support_agent" || !authed) return;
    if (resolvedPartnerPrepId === undefined) return;

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }

    const unsub = listenSupportInbox((convs: ConversationDoc[]) => {
      const newTotal = convs.reduce(
        (acc, c) => acc + (c.unreadCountSupport ?? 0),
        0,
      );
      setTotal(newTotal);

      const prev = prevTotalRef.current;
      prevTotalRef.current = newTotal;
      if (prev === null) return;
      if (newTotal <= prev) return;

      const onInboxPage = pathnameRef.current === INBOX_PATH;
      if (!onInboxPage) {
        toast.info(
          "Um estudante enviou uma mensagem. Clique na notificação para vê-la.",
          {
            autoClose: 15000,
            onClick: () => navigate(INBOX_PATH),
          },
        );
      }

      if (
        typeof document !== "undefined" &&
        document.hidden &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        const n = new Notification("Um estudante enviou uma mensagem", {
          body: "Clique para abrir a inbox de suporte",
          tag: "support-inbox",
        });
        n.onclick = () => {
          window.focus();
          navigate(INBOX_PATH);
          n.close();
        };
      }
    }, resolvedPartnerPrepId);

    return () => {
      unsub();
      prevTotalRef.current = null;
      setTotal(0);
    };
  }, [role, authed, navigate, resolvedPartnerPrepId]);

  return null;
}
