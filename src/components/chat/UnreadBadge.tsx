import { Badge } from "@/components/ui/badge";

export function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <Badge variant="destructive" className="ml-2">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
