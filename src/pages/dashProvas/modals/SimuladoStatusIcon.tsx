import { dashV2 } from "@/components/dashV2";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import { statusVisual, type FormaDoIcone } from "./simuladoStatus";

const ICONES: Record<FormaDoIcone, typeof CheckCircleIcon> = {
  cadeado: LockClosedIcon,
  relogio: ClockIcon,
  expirado: XCircleIcon,
  check: CheckCircleIcon,
};

/**
 * O status do simulado como ícone só, com a explicação no tooltip.
 *
 * ⚠️ **Isto não é o `StatusBadge` do dashV2 sem rótulo.** Aquele componente
 * proíbe modo só-ícone por escrito, e a proibição continua valendo para as
 * listagens. Aqui a tela é um modal estreito onde a coluna de status disputa
 * espaço com o nome do simulado, e a decisão foi tomada sabendo o que se
 * perde. Este componente é local ao `dashProvas` de propósito — para a exceção
 * não virar o padrão por importação.
 *
 * ⚠️ **O que se perde: o tooltip não abre no toque.** O Radix abre no hover e
 * no foco de teclado; em tablet o ícone fica mudo para quem enxerga. Quem usa
 * leitor de tela está coberto pelo `aria-label`, que não depende de abrir
 * nada. É uma dash de administração, na prática usada no desktop.
 */
export function SimuladoStatusIcon({
  simulado,
}: {
  simulado: Pick<
    SimuladoResumo,
    "bloqueado" | "disponivelDe" | "disponivelAte"
  >;
}) {
  const { forma, tone, descricao } = statusVisual(simulado);
  const Icone = ICONES[forma];

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {/*
          ⚠️ `tabIndex={0}` é o que faz o tooltip existir para quem navega por
          teclado — sem ele, a explicação só chega a quem tem mouse.

          ⚠️ O `aria-label` duplica o texto do `TooltipContent`, e é de
          propósito: o Radix aponta um `aria-describedby` para o conteúdo, então
          um leitor de tela ouve a frase duas vezes. O contrário — confiar só no
          `describedby` — deixaria o ícone **sem nome acessível**, que é falha
          de verdade. Redundância é o lado certo de errar aqui.
        */}
        <span
          role="img"
          tabIndex={0}
          aria-label={descricao}
          data-forma={forma}
          data-tone={tone}
          className={cn(
            "inline-flex rounded-full",
            dashV2.status[tone].icon,
            dashV2.focus,
          )}
        >
          <Icone className="h-5 w-5" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{descricao}</TooltipContent>
    </Tooltip>
  );
}

export default SimuladoStatusIcon;
