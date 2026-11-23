import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleCheck, Clock, Lock, CircleX } from "lucide-react";
import { SimuladoResumo } from "../../../dtos/prova/prova";
import type { StatusV2 } from "@/components/dashV2";
import { statusVisual, type FormaDoIcone } from "./simuladoStatus";

/**
 * Cor do ícone sobre branco (>= 3:1). `running` fica em cinza: nenhum laranja
 * da paleta alcança 3:1, e quem distingue o estado é a forma do ícone.
 */
const COR_DO_ICONE: Record<StatusV2, string> = {
  done: "text-success",
  running: "text-muted-foreground",
  missing: "text-destructive",
  info: "text-info",
  neutral: "text-muted-foreground",
};

const ICONES: Record<FormaDoIcone, typeof CircleCheck> = {
  cadeado: Lock,
  relogio: Clock,
  expirado: CircleX,
  check: CircleCheck,
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
            COR_DO_ICONE[tone],
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
