import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ROTULO = {
  anterior: "Estudante anterior",
  proximo: "Próximo estudante",
} as const;

/**
 * Uma seta do cabeçalho do modal.
 *
 * ⚠️ **Desabilitada na ponta, nunca escondida.** Uma seta que some faz o
 * cabeçalho mudar de largura entre alunos, e o olho persegue o movimento.
 *
 * ⚠️ **`aria-label` sempre**: um botão que só tem ícone não é anunciado por
 * leitor de tela — e "‹" não é rótulo.
 *
 * ⚠️ **`print:hidden`**: numa folha impressa não há para onde navegar.
 */
export function SetaDeNavegacao({
  direcao,
  aoClicar,
}: {
  direcao: "anterior" | "proximo";
  /** `null` = ponta da lista. */
  aoClicar: (() => void) | null;
}) {
  const Icone = direcao === "anterior" ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <button
      type="button"
      data-seta={direcao}
      aria-label={ROTULO[direcao]}
      disabled={aoClicar === null}
      onClick={() => aoClicar?.()}
      className={cn(
        "shrink-0 rounded-md p-1 print:hidden",
        "disabled:cursor-not-allowed disabled:opacity-30",
        dashV2.text.secondary,
        dashV2.focus,
      )}
    >
      <Icone className="h-5 w-5" />
    </button>
  );
}
