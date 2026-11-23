import type { StatusVariant } from "@/components/ui/status-badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import type {
  EventoDaTimeline,
  TipoDeEvento,
} from "@/dtos/content/timelineDto";
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
import type { LucideIcon } from "lucide-react";
import { fraseDoEvento } from "./helpers";

const ICONE: Record<TipoDeEvento, LucideIcon> = {
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

const VARIANTE: Partial<Record<TipoDeEvento, StatusVariant>> = {
  aprovada: "success",
  proposta_aprovada: "success",
  rejeitada: "destructive",
  proposta_recusada: "destructive",
  resetada: "warning",
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
  const estado = erro
    ? "error"
    : !eventos
      ? "loading"
      : eventos.length === 0
        ? "empty"
        : "ready";
  return (
    <Timeline
      aria-label="Histórico da demanda"
      state={estado}
      onRetry={onTentarDeNovo}
      error={{
        title: "Não foi possível carregar o histórico.",
        message: erro ?? undefined,
      }}
      empty={{ title: "Nada registrado ainda." }}
    >
      {(eventos ?? []).map((e, i) => {
        const semUsuario = !e.por || e.por === e.porId;
        const material = e.material;
        return (
          <TimelineItem
            key={`${e.tipo}-${e.em}-${i}`}
            icon={ICONE[e.tipo] ?? CircleHelp}
            variant={VARIANTE[e.tipo] ?? "neutral"}
            who={
              semUsuario ? (
                <span className="font-normal italic text-muted-foreground">
                  usuário removido
                </span>
              ) : (
                e.por
              )
            }
            what={fraseDoEvento(e)}
            when={new Date(e.em)}
            detail={
              e.detalhe ? (
                <span className="whitespace-pre-wrap break-words">
                  {e.detalhe}
                </span>
              ) : undefined
            }
            action={
              material
                ? {
                    label: `Ver ${material.tipo === "video" ? "vídeo" : "documento"}`,
                    onClick: () => onVerMaterial(material),
                  }
                : undefined
            }
          />
        );
      })}
    </Timeline>
  );
}
