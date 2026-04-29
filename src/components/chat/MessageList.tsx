import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { listenMessages, type MessageDoc } from "@/services/firebase/messages";
import { ChatMessage } from "./ChatMessage";

interface Props {
  conversationId: string;
  currentUserId: string;
}

export function MessageList({ conversationId, currentUserId }: Props) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setHasSnapshot(false);
    const unsub = listenMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setHasSnapshot(true);
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (!hasSnapshot) {
    return (
      <ScrollArea className="flex-1 p-3">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-10 w-1/2" />
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-3 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Envie a primeira mensagem para começar.
        </p>
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
