import { useLayoutEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendMessage as apiSendMessage } from "@/services/chat/sendMessage";
import { useAuthStore } from "@/store/auth";

interface Props {
  conversationId: string;
  status?: "open" | "closed";
}

const MAX = 1000;
const MAX_LINES = 6;

export function ChatInput({ conversationId, status }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const jwt = useAuthStore((s) => s.data.token);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cresce com o texto até MAX_LINES; acima disso rola dentro da caixa.
  // Ao limpar após o envio, volta sozinho a uma linha.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const style = getComputedStyle(el);
    const border =
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const maxHeight =
      parseFloat(style.lineHeight) * MAX_LINES +
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      border;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + border, maxHeight)}px`;
  }, [value]);

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

  if (status === "closed") {
    return (
      <div className="border-t bg-page/50 px-4 py-3 text-center text-caption text-muted-foreground">
        Conversa encerrada
      </div>
    );
  }

  const charsLeft = MAX - value.length;
  const nearLimit = charsLeft < 100;

  return (
    <div className="border-t bg-white p-2 flex items-end gap-2">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
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
          className="chat-scrollbar w-full resize-none overflow-y-auto rounded-md border border-border bg-page/50 px-3 py-2 text-body text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary disabled:opacity-60 transition"
        />
        <span
          className={cn(
            "text-caption block text-right mt-0.5",
            nearLimit ? "text-warning font-semibold" : "text-muted-foreground",
          )}
        >
          {value.length}/{MAX}
        </span>
      </div>
      <Button
        onClick={handleSend}
        disabled={sending || !value.trim()}
        className="bg-cta hover:bg-cta text-cta-foreground gap-1.5 rounded-full px-4 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Enviar</span>
      </Button>
    </div>
  );
}
