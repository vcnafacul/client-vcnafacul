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
  onBack?: () => void;
  showAvatar?: boolean;
  avatarSeed?: string;
  status?: "open" | "closed";
  originPage?: string;
  device?: string;
  browser?: string;
  cursinhoLine?: string;
  cursinhoMissing?: boolean;
  className?: string;
}

export function ChatLayout({
  conversationId,
  currentUserId,
  title,
  subtitle,
  onClose,
  onBack,
  showAvatar,
  avatarSeed,
  status,
  originPage,
  device,
  browser,
  cursinhoLine,
  cursinhoMissing,
  className,
}: Props) {
  return (
    <Card className={cn("flex flex-col h-full w-full overflow-hidden", className)}>
      <ChatHeader
        conversationId={conversationId}
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        onBack={onBack}
        showAvatar={showAvatar}
        avatarSeed={avatarSeed}
        status={status}
        originPage={originPage}
        device={device}
        browser={browser}
        cursinhoLine={cursinhoLine}
        cursinhoMissing={cursinhoMissing}
      />
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
      />
      <ChatInput conversationId={conversationId} status={status} />
    </Card>
  );
}
