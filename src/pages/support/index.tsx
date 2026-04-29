import { useState } from "react";
import { toast } from "react-toastify";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ConfirmOpenDialog } from "@/components/chat/ConfirmOpenDialog";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/context/ChatProvider";
import { openConversation } from "@/services/chat/openConversation";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";

export default function SupportPage() {
  const active = useChatStore((s) => s.activeConversation);
  const { userId } = useChatContext();
  const jwt = useAuthStore((s) => s.data.token);
  const [confirmOpen, setConfirmOpen] = useState(!active);
  const [loading, setLoading] = useState(false);

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
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao abrir conversa";
      toast.error(message);
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
        />
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
