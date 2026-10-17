import { Button } from "@/components/ui/button";
import type {
  AnuladaDoRelatorio,
  JobDoRecalculo,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  consultarRecalculo,
  pedirRecalculo,
} from "@/services/relatorioSimulado/recalculoAnulacao";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FonteDoRelatorio } from "./fonteDoRelatorio";
import {
  textoDaDivergencia,
  textoDasFalhas,
  textoDoProgresso,
} from "./textosDaAnulacao";

export const INTERVALO_DO_POLLING_MS = 3000;

type Fase =
  | { tipo: "divergente" }
  | { tipo: "rodando"; job: JobDoRecalculo }
  | { tipo: "concluido"; job: JobDoRecalculo }
  | { tipo: "erro"; mensagem: string };

/**
 * O aviso de relatório desatualizado e o "Recalcular" (tickets/042, card 15).
 *
 * ⚠️ **Sair e voltar no meio do job mostra o progresso, sem disparar outro:**
 * o relatório traz o `jobAtivo`, e com ele o aviso já nasce acompanhando.
 * ⚠️ O polling (3 s) só roda com a aba VISÍVEL — e para quando o job termina.
 */
export function AvisoDeRecalculo({
  fonte,
  token,
  divergentes,
  anuladas,
  jobAtivo,
  aoConcluir,
}: {
  fonte: FonteDoRelatorio;
  token: string;
  divergentes: number;
  anuladas: AnuladaDoRelatorio[];
  jobAtivo: JobDoRecalculo | null;
  /** Recarrega o relatório quando o job termina. */
  aoConcluir: () => void;
}) {
  const [fase, setFase] = useState<Fase>(
    jobAtivo ? { tipo: "rodando", job: jobAtivo } : { tipo: "divergente" },
  );
  const [pedindo, setPedindo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A fonte num ref: quem monta passa um objeto novo a cada render.
  const fonteRef = useRef(fonte);
  fonteRef.current = fonte;

  const acompanhar = useCallback(async () => {
    try {
      const s = await consultarRecalculo(token, fonteRef.current);
      if (s.jobAtivo) {
        setFase({ tipo: "rodando", job: s.jobAtivo });
        return;
      }
      if (s.ultimoJob) {
        setFase({ tipo: "concluido", job: s.ultimoJob });
        aoConcluir();
      }
    } catch (e) {
      setFase({ tipo: "erro", mensagem: (e as Error).message });
    }
  }, [token, aoConcluir]);

  const rodando = fase.tipo === "rodando";
  useEffect(() => {
    if (!rodando) return;
    const tique = () => {
      timer.current = setTimeout(async () => {
        if (typeof document === "undefined" || document.visibilityState === "visible") {
          await acompanhar();
        }
        tique();
      }, INTERVALO_DO_POLLING_MS);
    };
    tique();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [rodando, acompanhar]);

  const recalcular = async () => {
    setPedindo(true);
    try {
      const r = await pedirRecalculo(token, fonteRef.current);
      if (r.job) setFase({ tipo: "rodando", job: r.job });
      else await acompanhar();
    } catch (e) {
      setFase({ tipo: "erro", mensagem: (e as Error).message });
    } finally {
      setPedindo(false);
    }
  };

  if (fase.tipo === "concluido") {
    const falhas = textoDasFalhas(fase.job.falhas);
    return (
      <div role="status" data-testid="recalculo-concluido" className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
        <p>
          Resultados recalculados{fase.job.regravados ? ` (${fase.job.regravados})` : ""}.
          {falhas && <span className="block text-amber-800">{falhas}</span>}
        </p>
      </div>
    );
  }

  if (fase.tipo === "rodando") {
    const { processados, total } = fase.job;
    const pct = total ? Math.round((Math.min(processados, total) / total) * 100) : 0;
    return (
      <div role="status" data-testid="recalculo-rodando" className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <p className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          {textoDoProgresso(processados, total)}
        </p>
        <div className="h-1.5 w-full rounded bg-amber-200" aria-hidden>
          <div className="h-1.5 rounded bg-amber-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (divergentes <= 0 && fase.tipo !== "erro") return null;

  return (
    <div role="note" data-testid="aviso-divergencia" className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          <strong>Relatório desatualizado.</strong> {textoDaDivergencia(anuladas, divergentes)}
          {fase.tipo === "erro" && <span className="block text-rose-700">{fase.mensagem}</span>}
        </span>
      </p>
      <Button size="sm" className="shrink-0 print:hidden" disabled={pedindo} onClick={recalcular}>
        {pedindo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Recalcular resultados
      </Button>
    </div>
  );
}
