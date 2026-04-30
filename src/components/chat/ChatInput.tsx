import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  const charsLeft = MAX - value.length;
  const nearLimit = charsLeft < 100;

  return (
    <div className="border-t bg-white p-2 flex items-end gap-2">
      <div className="flex-1">
        <textarea
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
          rows={1}
          className="w-full resize-none rounded-md border border-lightGray bg-backgroundGrey/50 px-3 py-2 text-sm text-darkGrey placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-marine/40 focus:border-marine disabled:opacity-60 transition"
        />
        <span
          className={cn(
            "text-[10px] block text-right mt-0.5",
            nearLimit ? "text-pink font-semibold" : "text-grey",
          )}
        >
          {value.length}/{MAX}
        </span>
      </div>
      <Button
        onClick={handleSend}
        disabled={sending || !value.trim()}
        className="bg-orange hover:bg-darkOrange text-white gap-1.5 rounded-full px-4 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Enviar</span>
      </Button>
    </div>
  );
}
