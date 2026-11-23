import type { StatusVariant } from "@/components/ui/status-badge";
import type { StatusV2 } from "./StatusBadge";

/** Os tons da Dash V2 nas variantes do design system (tickets/059 §3). */
export const VARIANTE_POR_TONE: Record<StatusV2, StatusVariant> = {
  done: "success",
  running: "warning",
  missing: "destructive",
  info: "info",
  neutral: "neutral",
};
