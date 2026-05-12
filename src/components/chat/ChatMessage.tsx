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
        "flex flex-col max-w-[75%] mb-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        isOwn ? "self-end items-end" : "self-start items-start",
      )}
    >
      <span className="text-[11px] text-grey font-medium">
        {message.senderName}
      </span>
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-sm",
          isOwn
            ? "bg-marine text-white rounded-br-sm"
            : "bg-backgroundGrey text-darkGrey border border-lightGray rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
      <span className="text-[10px] text-grey mt-0.5">{time}</span>
    </div>
  );
}
