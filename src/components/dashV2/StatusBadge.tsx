import { StatusBadge as UiStatusBadge, type StatusVariant } from "@/components/ui/status-badge";
/** Os cinco tons de status das listas do dash. */
export type StatusV2 = "done" | "running" | "info" | "missing" | "neutral";

export interface StatusBadgeProps {
  tone: StatusV2;
  /**
   * ⚠️ Obrigatório. **Não existe modo só-ícone.** Hoje o status é um triângulo no
   * canto do card: quem não conhece a convenção não sabe o que ele significa, e
   * leitor de tela não anuncia nada.
   */
  label: string;
  className?: string;
}

/** Os tons da Dash V2 nas variantes do design system (tickets/059 §3). */
export const VARIANTE_POR_TONE: Record<StatusV2, StatusVariant> = {
  done: "success",
  running: "warning",
  missing: "destructive",
  info: "info",
  neutral: "neutral",
};

/**
 * Adaptador do `components/ui/status-badge`, com a API de sempre (`tone` +
 * `label`) até a Task 11 (tickets/059). O `data-tone` continua: as telas testam
 * por ele.
 *
 * ⚠️ Burro de propósito: quem traduz `StatusEnum` → `tone` + rótulo é a tela.
 */
function StatusBadgeDash({ tone, label, className }: StatusBadgeProps) {
  return (
    <UiStatusBadge
      data-tone={tone}
      variant={VARIANTE_POR_TONE[tone]}
      look="dot"
      className={className}
    >
      {label}
    </UiStatusBadge>
  );
}

export const StatusBadge = Object.assign(StatusBadgeDash, { mobileRole: "status" as const });

export default StatusBadge;
