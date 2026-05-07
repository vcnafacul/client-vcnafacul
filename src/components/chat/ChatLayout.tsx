import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface Props {
  conversationId: string;
  currentUserId: string;
  title: string;
  onClose?: () => void;
  showAvatar?: boolean;
  avatarSeed?: string;
  status?: "open" | "closed";
  originPage?: string;
  device?: string;
  browser?: string;
}

export function ChatLayout({
  conversationId,
  currentUserId,
  title,
  onClose,
  showAvatar,
  avatarSeed,
  status,
  originPage,
  device,
  browser,
}: Props) {
  return (
    <Card className="flex flex-col h-full w-full overflow-hidden">
      <ChatHeader
        conversationId={conversationId}
        title={title}
        onClose={onClose}
        showAvatar={showAvatar}
        avatarSeed={avatarSeed}
        status={status}
        originPage={originPage}
        device={device}
        browser={browser}
      />
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
      />
      <ChatInput conversationId={conversationId} />
    </Card>
  );
}
