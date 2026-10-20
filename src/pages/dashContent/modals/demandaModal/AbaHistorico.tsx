import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  EventoDaTimeline,
  TipoDeEvento,
} from "@/dtos/content/timelineDto";
import { formatDateTime } from "@/utils/date";
import {
  CheckCircle2,
  CircleHelp,
  FilePlus2,
  GitPullRequestArrow,
  MessageSquareWarning,
  Replace,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Upload,
} from "lucide-react";
import type { ComponentType } from "react";
import { fraseDoEvento } from "./helpers";

const ICONE: Record<TipoDeEvento, ComponentType<{ className?: string }>> = {
  criada: FilePlus2,
  enviada: Upload,
  aprovada: CheckCircle2,
  rejeitada: MessageSquareWarning,
  resetada: RotateCcw,
  proposta_enviada: GitPullRequestArrow,
  proposta_aprovada: ThumbsUp,
  proposta_recusada: ThumbsDown,
  material_substituido: Replace,
  outro: CircleHelp,
};

const COR: Partial<Record<TipoDeEvento, string>> = {
  aprovada: "bg-emerald-100 text-emerald-800",
  proposta_aprovada: "bg-emerald-100 text-emerald-800",
  rejeitada: "bg-rose-100 text-rose-800",
  proposta_recusada: "bg-rose-100 text-rose-800",
  resetada: "bg-amber-100 text-amber-800",
};

interface Props {
  eventos: EventoDaTimeline[] | null;
  erro: string | null;
  onTentarDeNovo: () => void;
  onVerMaterial: (material: NonNullable<EventoDaTimeline["material"]>) => void;
}

/**
 * Linha do tempo da demanda (tickets/050): um ponto por evento, com quem,
 * quando e o detalhe (motivo da rejeição, comentário da proposta). Serve
 * para 3, 5 ou mais pessoas — cada ação é um evento.
 */
export function AbaHistorico({
  eventos,
  erro,
  onTentarDeNovo,
  onVerMaterial,
}: Props) {
  if (erro) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border p-4"
      >
        <p className="text-sm">Não foi possível carregar o histórico. {erro}</p>
        <Button variant="outline" size="sm" onClick={onTentarDeNovo}>
          Tentar de novo
        </Button>
      </div>
    );
  }
  if (!eventos) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!eventos.length) {
    return (
      <p className="text-sm text-muted-foreground">Nada registrado ainda.</p>
    );
  }
  return (
    <ol
      className="relative flex flex-col gap-5 pl-1"
      aria-label="Histórico da demanda"
    >
      {eventos.map((e, i) => {
        const Icone = ICONE[e.tipo] ?? CircleHelp;
        const ultimo = i === eventos.length - 1;
        const semUsuario = !e.por || e.por === e.porId;
        return (
          <li key={`${e.tipo}-${e.em}-${i}`} className="relative flex gap-3">
            {!ultimo && (
              <span
                aria-hidden
                className="absolute left-4 top-8 bottom-[-20px] w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${COR[e.tipo] ?? "bg-marine/10 text-marine"}`}
            >
              <Icone className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-sm leading-snug">
                <span
                  className={
                    semUsuario
                      ? "italic text-muted-foreground"
                      : "font-semibold"
                  }
                >
                  {semUsuario ? "usuário removido" : e.por}
                </span>{" "}
                {fraseDoEvento(e)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(e.em)}
              </p>
              {e.detalhe && (
                <p className="text-sm rounded-md bg-muted/60 px-3 py-2 whitespace-pre-wrap break-words">
                  {e.detalhe}
                </p>
              )}
              {e.material && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVerMaterial(e.material!)}
                  >
                    Ver {e.material.tipo === "video" ? "vídeo" : "documento"}
                  </Button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
