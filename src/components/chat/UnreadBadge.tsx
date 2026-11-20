import { palette } from "@/lib/palette";

export function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`${count} mensagens não lidas`}
      className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-caption font-bold text-white rounded-full shadow-sm"
      style={{
        backgroundImage: `linear-gradient(135deg, ${palette.orange[500]} 0%, ${palette.pink[600]} 100%)`,
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
