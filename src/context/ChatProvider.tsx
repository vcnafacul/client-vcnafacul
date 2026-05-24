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
import {
  listenStudentActiveConversation,
  listenStudentCooldown,
} from "@/services/firebase/conversations";
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
  const setActive = useChatStore((s) => s.setActiveConversation);
  const setPartnerPrepId = useChatStore((s) => s.setPartnerPrepId);
  const setCooldownUntil = useChatStore((s) => s.setCooldownUntil);
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubCooldownRef = useRef<(() => void) | null>(null);

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
        unsubCooldownRef.current?.();
        unsubCooldownRef.current = null;
        setAuthed(false);
        setActive(null);
        setCooldownUntil(null);
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
          unsubscribeRef.current?.();
          unsubscribeRef.current = listenStudentActiveConversation(
            decodedId,
            (conv) => setActive(conv),
          );
          unsubCooldownRef.current?.();
          unsubCooldownRef.current = listenStudentCooldown(
            decodedId,
            partnerPrepIdValue,
            (until) => setCooldownUntil(until),
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
      unsubCooldownRef.current?.();
      unsubCooldownRef.current = null;
    };
  }, [decodedId, isSupport, setAuthed, setActive, setPartnerPrepId, setCooldownUntil]);

  const active = useChatStore((s) => s.activeConversation);
  const studentUnread =
    role === "student" ? (active?.unreadCountStudent ?? 0) : 0;
  useTabTitleUnread(studentUnread);

  return (
    <ChatContext.Provider value={{ role, userId }}>
      {children}
    </ChatContext.Provider>
  );
}
