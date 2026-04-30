export function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white rounded-full shadow-sm"
      style={{
        backgroundImage: "linear-gradient(135deg, #FF7600 0%, #DA005A 100%)",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
