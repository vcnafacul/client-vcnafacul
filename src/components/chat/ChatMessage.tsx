import { cn } from "@/lib/utils";
import type { MessageDoc } from "@/services/firebase/messages";

interface Props {
  message: MessageDoc;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: Props) {
  const time = message.createdAt
    ? new Date(message.createdAt.toMillis()).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return (
    <div
      className={cn(
        "flex flex-col max-w-[75%] mb-2",
        isOwn ? "self-end items-end" : "self-start items-start",
      )}
    >
      <span className="text-xs text-muted-foreground">
        {message.senderName}
      </span>
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5">{time}</span>
    </div>
  );
}
