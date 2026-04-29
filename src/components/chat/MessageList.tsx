import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { listenMessages } from "@/services/firebase/messages";
import { useChatStore } from "@/store/chatStore";
import { ChatMessage } from "./ChatMessage";

interface Props {
  conversationId: string;
  currentUserId: string;
}

export function MessageList({ conversationId, currentUserId }: Props) {
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = listenMessages(conversationId, (msgs) => setMessages(msgs));
    return unsub;
  }, [conversationId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-3">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-10 w-1/2" />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-3">
      <div className="flex flex-col">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            isOwn={m.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
