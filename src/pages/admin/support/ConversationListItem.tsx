import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "@/components/chat/UnreadBadge";
import {
  avatarColorFor,
  initialsOf,
} from "@/components/chat/avatarUtils";
import type { ConversationDoc } from "@/services/firebase/conversations";

interface Props {
  conv: ConversationDoc;
  selected: boolean;
  onClick: () => void;
}

function formatRelative(ts?: { toMillis: () => number }): string | null {
  if (!ts) return null;
  try {
    return formatDistanceToNowStrict(new Date(ts.toMillis()), {
      addSuffix: false,
      locale: ptBR,
    });
  } catch {
    return null;
  }
}

export function ConversationListItem({ conv, selected, onClick }: Props) {
  const unread = (conv.unreadCountSupport ?? 0) > 0;
  const initials = initialsOf(conv.userName);
  const avatarBg = avatarColorFor(conv.userId ?? conv.userName);
  const time = formatRelative(conv.lastMessageAt);

  const previewPrefix =
    conv.lastMessageSenderType === "support" ? "Você: " : "";
  const preview = conv.lastMessageText
    ? `${previewPrefix}${conv.lastMessageText}`
    : conv.metadata?.page ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 border-b transition-colors relative",
        "hover:bg-marine/5 animate-in fade-in-0 duration-150",
        selected && "bg-marine/5",
        !selected && unread && "bg-lightYellow/40",
      )}
    >
      {selected && (
        <span
          className="absolute left-0 top-0 bottom-0 w-1 bg-orange"
          aria-hidden
        />
      )}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
            avatarBg,
          )}
          aria-hidden
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span
              className={cn(
                "text-sm truncate",
                unread ? "font-bold text-marine" : "font-medium text-darkGrey",
              )}
            >
              {conv.userName}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {time && (
                <span className="text-[10px] text-grey whitespace-nowrap">
                  {time}
                </span>
              )}
              {unread && (
                <span
                  className="h-2 w-2 rounded-full bg-orange animate-pulse"
                  aria-hidden
                />
              )}
              <UnreadBadge count={conv.unreadCountSupport ?? 0} />
            </div>
          </div>
          {preview && (
            <span
              className={cn(
                "text-xs block truncate mt-0.5",
                unread ? "text-darkGrey" : "text-grey",
              )}
            >
              {preview}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
