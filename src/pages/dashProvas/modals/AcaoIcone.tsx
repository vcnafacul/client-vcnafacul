import { dashV2 } from "@/components/dashV2";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

export interface AcaoIconeProps {
  icone: ComponentType<{ className?: string }>;
  /** Vira o nome acessível do botão e o texto do tooltip quando ativo. */
  rotulo: string;
  onClick?: () => void;
  desabilitado?: boolean;
  /** Mostrado no lugar do rótulo quando desabilitado. Diga o *motivo*. */
  motivoDesabilitado?: string;
  carregando?: boolean;
}

/**
 * Botão de ação em ícone, com tooltip.
 *
 * ⚠️ **`aria-disabled`, e não `disabled`.** Botão nativo desabilitado não
 * recebe foco nem dispara evento de mouse — o tooltip pendurado nele nunca
 * abre, então o motivo de estar bloqueado não chega justamente a quem precisa
 * dele. Era o que acontecia nesta tela: três botões desabilitados com `title`
 * que o navegador não mostrava.
 *
 * ⚠️ Isto difere do `DashToolbar`, que embrulha o botão num `<span>` focável.
 * Lá o `disabled` faz parte da API pública do componente e não dá para trocar;
 * aqui os botões são todos deste arquivo, e um único alvo de foco é melhor que
 * um `span` por fora.
 *
 * ⚠️ Com `aria-disabled` o clique **continua chegando** — quem barra é o
 * `onClick` abaixo. Tirar essa guarda reabre a ação sem nenhum aviso visual.
 */
export function AcaoIcone({
  icone: Icone,
  rotulo,
  onClick,
  desabilitado = false,
  motivoDesabilitado,
  carregando = false,
}: AcaoIconeProps) {
  const inerte = desabilitado || carregando;
  const texto = desabilitado ? (motivoDesabilitado ?? rotulo) : rotulo;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={texto}
          aria-disabled={inerte || undefined}
          aria-busy={carregando || undefined}
          onClick={() => {
            if (inerte) return;
            onClick?.();
          }}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            dashV2.focus,
            inerte
              ? cn(
                  dashV2.text.muted,
                  "opacity-50",
                  carregando ? "cursor-wait" : "cursor-not-allowed",
                )
              : cn(
                  dashV2.text.secondary,
                  "hover:bg-backgroundGrey hover:text-marine",
                ),
          )}
        >
          {carregando ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <Icone className="h-5 w-5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{texto}</TooltipContent>
    </Tooltip>
  );
}

export default AcaoIcone;
