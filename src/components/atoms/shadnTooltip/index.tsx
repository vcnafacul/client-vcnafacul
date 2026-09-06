import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  content: string;
  /**
   * Atraso em ms antes de abrir no hover. Sem valor, mantem o default do
   * Radix (700ms) — que e o comportamento de quem ja usava este componente.
   */
  delayDuration?: number;
}

export function ShadcnTooltip({ children, content, delayDuration }: Props) {
  return (
    // Cada tooltip tem o proprio Provider, entao o skipDelayDuration do Radix
    // (abrir na hora ao passar de um gatilho para o outro) nao se aplica entre
    // instancias: o atraso e pago de novo em cada gatilho.
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
