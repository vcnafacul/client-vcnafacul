import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { listenMessages, type MessageDoc } from "@/services/firebase/messages";
import { useChatContext } from "@/context/ChatProvider";
import { ChatMessage } from "./ChatMessage";

interface Props {
  conversationId: string;
  currentUserId: string;
}

export function MessageList({ conversationId, currentUserId }: Props) {
  const { role } = useChatContext();
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setHasSnapshot(false);
    // Estudante precisa filtrar por conversationUserId pra satisfazer security rule
    // (Firestore exige query filtrada quando rule depende de campo da doc).
    const studentFilter = role === "student" ? currentUserId : undefined;
    const unsub = listenMessages(
      conversationId,
      (msgs) => {
        setMessages(msgs);
        setHasSnapshot(true);
      },
      studentFilter,
    );
    return unsub;
  }, [conversationId, role, currentUserId]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (!hasSnapshot) {
    return (
      <ScrollArea className="flex-1 p-3 bg-backgroundGrey/30">
        <Skeleton className="h-10 w-3/4 mb-2 bg-lightGray/60" />
        <Skeleton className="h-10 w-1/2 bg-lightGray/60" />
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 bg-backgroundGrey/30">
        <div className="flex flex-col items-center justify-center h-full py-10 px-6 gap-2 text-center">
          <span className="h-12 w-12 rounded-full bg-marine/10 flex items-center justify-center text-2xl">
            👋
          </span>
          <p className="text-sm font-medium text-marine">
            Comece a conversa
          </p>
          <p className="text-xs text-grey max-w-[220px]">
            Envie a primeira mensagem e nossa equipe responderá em breve.
          </p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-3 bg-backgroundGrey/30">
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
