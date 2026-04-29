import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface Props {
  conversationId: string;
  currentUserId: string;
  title: string;
  onClose?: () => void;
}

export function ChatLayout({
  conversationId,
  currentUserId,
  title,
  onClose,
}: Props) {
  return (
    <Card className="flex flex-col h-full w-full overflow-hidden">
      <ChatHeader
        conversationId={conversationId}
        title={title}
        onClose={onClose}
      />
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
      />
      <ChatInput conversationId={conversationId} />
    </Card>
  );
}
