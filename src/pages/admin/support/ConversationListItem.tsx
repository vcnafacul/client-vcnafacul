import { cn } from "@/lib/utils";
import { UnreadBadge } from "@/components/chat/UnreadBadge";
import type { ConversationDoc } from "@/services/firebase/conversations";

interface Props {
  conv: ConversationDoc;
  selected: boolean;
  onClick: () => void;
}

export function ConversationListItem({ conv, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 hover:bg-muted border-b transition",
        selected && "bg-muted",
      )}
    >
      <div className="flex justify-between items-start">
        <span className="font-medium text-sm">{conv.userName}</span>
        <UnreadBadge count={conv.unreadCountSupport ?? 0} />
      </div>
      {conv.metadata?.page && (
        <span className="text-xs text-muted-foreground">
          {conv.metadata.page}
        </span>
      )}
    </button>
  );
}
