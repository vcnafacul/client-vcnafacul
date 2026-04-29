import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage as apiSendMessage } from "@/services/chat/sendMessage";
import { useAuthStore } from "@/store/auth";

interface Props {
  conversationId: string;
}

const MAX = 1000;

export function ChatInput({ conversationId }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const jwt = useAuthStore((s) => s.data.token);

  async function handleSend() {
    const v = value.trim();
    if (!v || sending) return;
    setSending(true);
    try {
      await apiSendMessage(jwt, conversationId, v);
      setValue("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao enviar";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t p-2 flex items-end gap-2">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX))}
          placeholder="Escreva sua mensagem..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
        />
        <span className="text-[10px] text-muted-foreground">
          {value.length}/{MAX}
        </span>
      </div>
      <Button onClick={handleSend} disabled={sending || !value.trim()}>
        Enviar
      </Button>
    </div>
  );
}
