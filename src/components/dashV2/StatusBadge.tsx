import { cn } from "@/lib/utils";
import { dashV2, type StatusV2 } from "./tokens";

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

/**
 * Marcador colorido + texto.
 *
 * ⚠️ Burro de propósito: `tone` é `done | running | missing | neutral`, e não
 * um enum de domínio. Quem traduz `StatusEnum` → `tone` + rótulo é a tela.
 * Assim o badge serve prova, conteúdo, notícia e o que vier sem ganhar um `if`.
 *
 * ⚠️ A cor vai no ponto; o texto fica em `marine`. Nenhuma cor de acento da
 * paleta carrega texto pequeno sobre branco (ver medições no `tokens.ts`).
 */
export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  const { chip, dot } = dashV2.status[tone];
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        chip,
        dashV2.text.primary,
        className,
      )}
    >
      {/* Pista rápida, não o portador do significado — o rótulo é que informa. */}
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
      {label}
    </span>
  );
}

export default StatusBadge;
