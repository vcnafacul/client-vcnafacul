import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { closeConversation } from "@/services/chat/closeConversation";
import { useAuthStore } from "@/store/auth";

interface Props {
  conversationId: string;
  title: string;
  onClose?: () => void;
}

export function ChatHeader({ conversationId, title, onClose }: Props) {
  const jwt = useAuthStore((s) => s.data.token);

  async function handleEnd() {
    if (!window.confirm("Encerrar conversa?")) return;
    try {
      await closeConversation(jwt, conversationId);
      onClose?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao encerrar conversa";
      toast.error(message);
    }
  }

  return (
    <div className="flex items-center justify-between border-b p-2">
      <span className="font-medium text-sm">{title}</span>
      <Button variant="ghost" size="sm" onClick={handleEnd}>
        Encerrar
      </Button>
    </div>
  );
}
