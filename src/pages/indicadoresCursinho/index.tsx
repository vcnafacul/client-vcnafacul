import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelError } from "@/pages/dashboard/components/Panel";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import {
  getIndicadores,
  getPeriodosDosIndicadores,
  Indicadores,
  PeriodosDoCursinho,
} from "@/services/indicadores";
import { useAuthStore } from "@/store/auth";
import {
  periodoInicial,
  rotuloDaAtualizacao,
  rotuloDoPeriodo,
} from "./periodo";
import { SecoesDosIndicadores } from "./SecoesDosIndicadores";

/**
 * Indicadores do cursinho (tickets/033). Esta tela é só a casa: o card de
 * cada pergunta acrescenta a sua seção em `SecoesDosIndicadores`.
 */
export default function IndicadoresCursinho() {
  const token = useAuthStore((s) => s.data.token);
  const [periodos, setPeriodos] = useState<PeriodosDoCursinho | null>(null);
  const [periodoId, setPeriodoId] = useState<string | null>(null);
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarPeriodos = useCallback(() => {
    setErro(false);
    getPeriodosDosIndicadores(token)
      .then((r) => {
        setPeriodos(r);
        setPeriodoId(periodoInicial(r.periodos)?.id ?? null);
        if (r.periodos.length === 0) setCarregando(false);
      })
      .catch(() => {
        setErro(true);
        setCarregando(false);
      });
  }, [token]);

  useEffect(carregarPeriodos, [carregarPeriodos]);

  const carregarIndicadores = useCallback(() => {
    if (!periodoId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(false);
    getIndicadores(token, periodoId)
      .then((r) => !cancelado && setDados(r))
      .catch(() => !cancelado && setErro(true))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [token, periodoId]);

  useEffect(carregarIndicadores, [carregarIndicadores]);

  const lista = periodos?.periodos ?? [];
  const periodo = lista.find((p) => p.id === periodoId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-marine">Indicadores</h1>
          <p className="mt-1 text-sm text-slate-500">
            Como estão os alunos do seu cursinho neste período letivo.
          </p>
        </div>
        {lista.length > 0 && (
          <div className="flex flex-col gap-1 sm:items-end">
            <Select
              value={periodoId ?? undefined}
              onValueChange={setPeriodoId}
            >
              <SelectTrigger
                aria-label="Período letivo"
                className="w-full bg-white sm:w-72"
              >
                <SelectValue placeholder="Escolha o período letivo" />
              </SelectTrigger>
              <SelectContent>
                {lista.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {rotuloDoPeriodo(p)}
                    {p.emAndamento ? " · em andamento" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {periodo && dados && !carregando && (
              <span className="text-xs text-slate-400">
                {rotuloDaAtualizacao(periodo, dados.atualizadoEm)}
              </span>
            )}
          </div>
        )}
      </header>

      {!!periodos?.turmasSemPeriodo && (
        <p className="rounded-xl border border-orange/30 bg-orange/[0.06] px-4 py-3 text-sm text-slate-600">
          {periodos.turmasSemPeriodo === 1
            ? "1 turma sem período letivo não entra nestes números. "
            : `${periodos.turmasSemPeriodo} turmas sem período letivo não entram nestes números. `}
          <Link
            to={`${DASH}/${PARTNER_CLASS}`}
            className="font-medium text-marine underline-offset-2 hover:underline"
          >
            Ver turmas
          </Link>
        </p>
      )}

      {erro ? (
        <PanelError retry={periodoId ? carregarIndicadores : carregarPeriodos} />
      ) : periodos && lista.length === 0 ? (
        <SemPeriodo />
      ) : carregando || !dados ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <SecoesDosIndicadores dados={dados} />
      )}
    </div>
  );
}

function SemPeriodo() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <p className="font-medium text-marine">Nenhum período letivo cadastrado</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Os indicadores são calculados por período letivo. Cadastre o período e
        ligue as turmas a ele para ver os números aqui.
      </p>
      <Link
        to={`${DASH}/${PARTNER_CLASS}`}
        className="mt-4 inline-block text-sm font-medium text-marine underline-offset-2 hover:underline"
      >
        Ir para Turmas
      </Link>
    </div>
  );
}
