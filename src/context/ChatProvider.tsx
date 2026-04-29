/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { signInFirebase, signOutFirebase } from "@/services/firebase/auth";
import { getFirebaseToken } from "@/services/chat/getFirebaseToken";
import { listenStudentActiveConversation } from "@/services/firebase/conversations";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/auth";
import { jwtDecoded } from "@/utils/jwt";

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
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const jwt = data?.token;
  const isSupport = !!data?.permissao?.support_agent;

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      // Cleanup if logged out
      if (!jwt) {
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
        setAuthed(false);
        setActive(null);
        setRole(null);
        setUserId(null);
        await signOutFirebase().catch(() => {});
        return;
      }

      let decodedId: string | null = null;
      try {
        const decoded = jwtDecoded(jwt);
        decodedId = decoded?.user?.id ?? null;
      } catch {
        return;
      }
      if (!decodedId) return;

      try {
        const token = await getFirebaseToken(jwt);
        await signInFirebase(token);
        if (cancelled) return;
        setAuthed(true);
        const r: Role = isSupport ? "support_agent" : "student";
        setRole(r);
        setUserId(decodedId);

        if (r === "student") {
          unsubscribeRef.current?.();
          unsubscribeRef.current = listenStudentActiveConversation(
            decodedId,
            (conv) => setActive(conv),
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
  }, [jwt, isSupport, setAuthed, setActive]);

  return (
    <ChatContext.Provider value={{ role, userId }}>
      {children}
    </ChatContext.Provider>
  );
}
