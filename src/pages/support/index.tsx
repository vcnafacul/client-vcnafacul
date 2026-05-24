import { useEffect, useRef, useState } from "react";
import { LuHeadset } from "react-icons/lu";
import { toast } from "react-toastify";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ConfirmOpenDialog } from "@/components/chat/ConfirmOpenDialog";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/context/ChatProvider";
import {
  CooldownError,
  openConversation,
} from "@/services/chat/openConversation";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function SupportPage() {
  const active = useChatStore((s) => s.activeConversation);
  const cooldownUntil = useChatStore((s) => s.cooldownUntil);
  const setCooldownUntil = useChatStore((s) => s.setCooldownUntil);
  const { userId } = useChatContext();
  const jwt = useAuthStore((s) => s.data.token);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [closedBySupport, setClosedBySupport] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    if (prevActiveRef.current && !active) {
      setClosedBySupport(true);
    }
    prevActiveRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!cooldownUntil) { setRemainingSeconds(0); return; }
    const compute = () => Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    setRemainingSeconds(compute());
    const id = setInterval(() => {
      const r = compute();
      setRemainingSeconds(r);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  async function handleConfirm() {
    if (!jwt) return;
    setLoading(true);
    try {
      await openConversation(jwt, {
        page: "/suporte",
        userAgent: navigator.userAgent.slice(0, 500),
        device: window.matchMedia("(max-width: 768px)").matches
          ? "mobile"
          : "desktop",
        browser: "other",
      });
      setConfirmOpen(false);
      setClosedBySupport(false);
    } catch (e) {
      if (e instanceof CooldownError) {
        setConfirmOpen(false);
        setCooldownUntil(Date.now() + e.retryAfterSeconds * 1000);
        toast.info(
          "Aguarde um instante para abrir uma nova sessão.",
        );
      } else {
        toast.error(e instanceof Error ? e.message : "Falha ao abrir conversa");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 h-[calc(100vh-100px)]">
      {active && userId ? (
        <ChatLayout
          conversationId={active.id}
          currentUserId={userId}
          title="Suporte"
          status={active.status}
          onClose={() => setClosedBySupport(true)}
        />
      ) : closedBySupport ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
          <LuHeadset className="h-12 w-12 text-marine/30" />
          <span className="font-raleway font-semibold text-marine">
            Conversa encerrada
          </span>
          <span className="text-sm text-grey max-w-xs">
            Esta conversa foi encerrada. Se precisar de mais ajuda, você pode
            abrir uma nova conversa.
          </span>
          {remainingSeconds > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold font-mono text-marine">
                {formatCountdown(remainingSeconds)}
              </span>
              <span className="text-xs text-grey">
                Aguarde para iniciar uma nova conversa
              </span>
            </div>
          ) : (
            <Button onClick={() => setConfirmOpen(true)}>
              Iniciar nova conversa
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>Você ainda não tem uma conversa aberta.</p>
          <Button onClick={() => setConfirmOpen(true)}>Iniciar conversa</Button>
        </div>
      )}
      <ConfirmOpenDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  );
}
