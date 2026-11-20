import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * O texto do (i) de cada métrica. Quem lê é o cursinho, não um desenvolvedor:
 * nada de nome de campo, status em inglês ou "o sistema" (tickets/033, R2/R3).
 */
export interface ExplicacaoDaMetrica {
  oQueE: string;
  comoContamos: string;
  ficaDeFora?: string;
}

interface Props {
  metrica: string;
  explicacao: ExplicacaoDaMetrica;
}

/**
 * Ícone (i) ao lado do nome da métrica. Popover e não tooltip: tooltip de
 * hover não abre no celular, e é no celular que boa parte dos cursinhos usa.
 */
export function InfoDaMetrica({ metrica, explicacao }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Como calculamos: ${metrica}`}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Info className="h-4 w-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-[min(20rem,calc(100vw-2rem))] space-y-2 text-sm leading-relaxed text-muted-foreground"
      >
        <p className="font-semibold text-foreground">{metrica}</p>
        <Parte titulo="O que é">{explicacao.oQueE}</Parte>
        <Parte titulo="Como contamos">{explicacao.comoContamos}</Parte>
        {explicacao.ficaDeFora && (
          <Parte titulo="Fica de fora">{explicacao.ficaDeFora}</Parte>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Parte({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <span className="font-medium text-foreground">{titulo}: </span>
      {children}
    </p>
  );
}
