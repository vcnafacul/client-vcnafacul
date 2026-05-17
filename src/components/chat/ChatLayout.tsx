import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

interface Props {
  conversationId: string;
  currentUserId: string;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  showAvatar?: boolean;
  avatarSeed?: string;
  status?: "open" | "closed";
  originPage?: string;
  device?: string;
  browser?: string;
  className?: string;
}

export function ChatLayout({
  conversationId,
  currentUserId,
  title,
  subtitle,
  onClose,
  showAvatar,
  avatarSeed,
  status,
  originPage,
  device,
  browser,
  className,
}: Props) {
  return (
    <Card className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      <ChatHeader
        conversationId={conversationId}
        title={title}
        subtitle={subtitle}
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
