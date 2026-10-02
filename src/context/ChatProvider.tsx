/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { signInFirebase, signOutFirebase } from "@/services/firebase/auth";
import { getFirebaseToken } from "@/services/chat/getFirebaseToken";
import { listenStudentConversations } from "@/services/firebase/conversations";
import {
  conversasVisiveis,
  cooldownDoDestino,
  naoLidasDoEstudante,
} from "@/services/chat/conversasDoEstudante";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/auth";
import { jwtDecoded } from "@/utils/jwt";
import { useTabTitleUnread } from "@/hooks/useTabTitleUnread";
import { getFirebaseAuth } from "@/services/firebase/client";

type Role = "student" | "support_agent" | null;

interface ChatContextValue {
  role: Role;
  userId: string | null;
}

const ChatContext = createContext<ChatContextValue>({
  role: null,
  userId: null,
});

export const useChatContext = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data } = useAuthStore();
  const setAuthed = useChatStore((s) => s.setFirebaseAuthed);
  const setConversations = useChatStore((s) => s.setConversations);
  const resetConversations = useChatStore((s) => s.resetConversations);
  const setPartnerPrepId = useChatStore((s) => s.setPartnerPrepId);
  const setCooldownUntil = useChatStore((s) => s.setCooldownUntil);
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const jwt = data?.token;
  const isSupport =
    !!data?.permissao?.supportAgent ||
    !!data?.permissao?.partnerPrepSupportAgent;

  const decodedId = useMemo(() => {
    if (!jwt) return null;
    try {
      return jwtDecoded(jwt)?.user?.id ?? null;
    } catch {
      return null;
    }
  }, [jwt]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      // Cleanup if logged out / no identity
      if (!decodedId) {
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
        setAuthed(false);
        resetConversations();
        setRole(null);
        setUserId(null);
        setPartnerPrepId(null);
        await signOutFirebase().catch(() => {});
        return;
      }

      try {
        // Read latest jwt from store inside the effect so we don't re-auth
        // on every JWT rotation (fetchWrapper refresh) — only on identity
        // change.
        const currentJwt = useAuthStore.getState().data?.token;
        if (!currentJwt) return;
        const token = await getFirebaseToken(currentJwt);
        await signInFirebase(token);
        if (cancelled) return;
        setAuthed(true);
        const r: Role = isSupport ? "support_agent" : "student";
        setRole(r);
        setUserId(decodedId);

        // Extract partnerPrepId from Firebase ID token claims
        let partnerPrepIdValue: string | null = null;
        const auth = getFirebaseAuth();
        if (auth.currentUser) {
          const idTokenResult = await auth.currentUser.getIdTokenResult();
          partnerPrepIdValue = (idTokenResult.claims.partnerPrepId as string) ?? null;
          setPartnerPrepId(partnerPrepIdValue);
        }

        if (r === "student") {
          // tickets/031, card 03: todas as conversas (uma aberta por destino).
          unsubscribeRef.current?.();
          unsubscribeRef.current = listenStudentConversations(
            decodedId,
            (todas) => {
              const visiveis = conversasVisiveis(todas);
              setConversations(visiveis);
              // ⚠️ Antes vinha da claim `partnerPrepId` do token — que, para
              // estudante, é sempre nula: só vigiava o projeto. Continua sendo
              // o cooldown do projeto aqui (o `/suporte` e o balão fora das
              // páginas de inscrição); o de cada cursinho sai de
              // `cooldownDoDestino` onde o destino é conhecido.
              setCooldownUntil(cooldownDoDestino(visiveis, null));
            },
          );
        }
      } catch (err) {
        console.error("[ChatProvider] bootstrap failed", err);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [
    decodedId,
    isSupport,
    setAuthed,
    setConversations,
    resetConversations,
    setPartnerPrepId,
    setCooldownUntil,
  ]);

  // Título da aba: soma de todas as conversas, não só da ativa.
  const conversas = useChatStore((s) => s.conversations);
  const studentUnread = role === "student" ? naoLidasDoEstudante(conversas) : 0;
  useTabTitleUnread(studentUnread);

  return (
    <ChatContext.Provider value={{ role, userId }}>
      {children}
    </ChatContext.Provider>
  );
}
