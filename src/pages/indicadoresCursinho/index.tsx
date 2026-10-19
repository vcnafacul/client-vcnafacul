import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SeletorDeCursinho } from "@/components/molecules/seletorDeCursinho";
import { Roles } from "@/enums/roles/roles";
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
  IndicadoresDeTodos,
  PeriodosDoCursinho,
  SemCursinho,
} from "@/services/indicadores";
import {
  getPartnerPrepCourseLogos,
  PartnerPrepCourseLogo,
} from "@/services/prepCourse/partnerLogos";
import { useAuthStore } from "@/store/auth";
import {
  rotuloDaAtualizacao,
  rotuloDoPeriodo,
} from "./periodo";
import { CursinhoDosIndicadores } from "./cursinhoDosIndicadores";
import { SecoesDosIndicadores } from "./SecoesDosIndicadores";

/** O valor de "Todos os períodos" no seletor (tickets/046). */
const TODOS = "todos";

/**
 * Indicadores do cursinho (tickets/033). Esta tela é só a casa: o card de
 * cada pergunta acrescenta a sua seção em `SecoesDosIndicadores`.
 *
 * tickets/045 — o admin da plataforma (`alterarPermissao`) escolhe outro
 * cursinho no topo e vê a tela como aquele cursinho vê.
 */
export default function IndicadoresCursinho() {
  const podeVerOutros = useAuthStore(
    (s) => !!s.data.permissao?.[Roles.alterarPermissao],
  );
  return <TelaDosIndicadores podeVerOutros={podeVerOutros} />;
}

export function TelaDosIndicadores({
  podeVerOutros,
}: {
  podeVerOutros: boolean;
}) {
  const token = useAuthStore((s) => s.data.token);

  // tickets/045 — o cursinho escolhido mora na URL (`?cursinho=`).
  const [params, setParams] = useSearchParams();
  const [cursinhos, setCursinhos] = useState<PartnerPrepCourseLogo[]>([]);
  const [carregandoCursinhos, setCarregandoCursinhos] = useState(podeVerOutros);
  useEffect(() => {
    if (!podeVerOutros) return;
    getPartnerPrepCourseLogos()
      .then(setCursinhos)
      .catch(() => setCursinhos([]))
      .finally(() => setCarregandoCursinhos(false));
  }, [podeVerOutros]);
  const outro = useMemo(() => {
    if (!podeVerOutros) return null;
    const id = params.get("cursinho");
    return cursinhos.find((c) => c.id === id) ?? null;
  }, [podeVerOutros, params, cursinhos]);
  const cursinhoId = outro?.id;
  const esperandoLista =
    podeVerOutros && carregandoCursinhos && !!params.get("cursinho");
  const escolher = (id: string | null) => {
    const proximos = new URLSearchParams(params);
    if (id) proximos.set("cursinho", id);
    else proximos.delete("cursinho");
    // o período é do cursinho anterior: volta para todos
    proximos.delete("periodo");
    setParams(proximos);
  };
  const [semCursinho, setSemCursinho] = useState(false);

  const [periodos, setPeriodos] = useState<PeriodosDoCursinho | null>(null);
  /** De qual cursinho são os `periodos` carregados (undefined = o próprio). */
  const [periodosDe, setPeriodosDe] = useState<string | undefined | null>(null);
  const [dados, setDados] = useState<Indicadores | IndicadoresDeTodos | null>(
    null,
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarPeriodos = useCallback(() => {
    // com `?cursinho=` na URL, espera a lista para não abrir o próprio antes
    if (esperandoLista) return;
    setErro(false);
    setSemCursinho(false);
    setPeriodos(null);
    setPeriodosDe(null);
    setDados(null);
    setCarregando(true);
    let cancelado = false;
    getPeriodosDosIndicadores(token, cursinhoId)
      .then((r) => {
        // trocou de cursinho com esta resposta em voo: descarta
        if (cancelado) return;
        setPeriodos(r);
        setPeriodosDe(cursinhoId);
        if (r.periodos.length === 0) setCarregando(false);
      })
      .catch((e) => {
        if (cancelado) return;
        if (e instanceof SemCursinho && podeVerOutros) setSemCursinho(true);
        else setErro(true);
        setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token, cursinhoId, esperandoLista, podeVerOutros]);

  useEffect(carregarPeriodos, [carregarPeriodos]);

  // tickets/046 — o período vem da URL (`?periodo=`); sem ele, ou com um id
  // que não é deste cursinho, a visão de todos os períodos (D4).
  const lista = periodos?.periodos ?? [];
  const periodoDaUrl = params.get("periodo");
  const periodoId = lista.some((p) => p.id === periodoDaUrl)
    ? periodoDaUrl
    : null;
  const prontos =
    periodos !== null && periodosDe === cursinhoId && lista.length > 0;
  const escolherPeriodo = (v: string) => {
    const proximos = new URLSearchParams(params);
    if (v === TODOS) proximos.delete("periodo");
    else proximos.set("periodo", v);
    setParams(proximos);
  };

  const carregarIndicadores = useCallback(() => {
    // só com os períodos do cursinho certo: ao trocar de cursinho, não sai um
    // pedido com o período do anterior na rota do novo
    if (!prontos) return;
    let cancelado = false;
    setCarregando(true);
    setErro(false);
    getIndicadores(token, periodoId, cursinhoId)
      .then((r) => !cancelado && setDados(r))
      .catch(() => !cancelado && setErro(true))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [token, periodoId, cursinhoId, prontos]);

  useEffect(carregarIndicadores, [carregarIndicadores]);

  const periodo = lista.find((p) => p.id === periodoId);
  const recorte = periodoId
    ? "neste período letivo"
    : "em todos os períodos letivos";

  return (
    <CursinhoDosIndicadores.Provider value={cursinhoId}>
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-marine">Indicadores</h1>
            <p className="mt-1 text-sm text-slate-500">
              {outro
                ? `Como estão os alunos de ${outro.name} ${recorte}.`
                : semCursinho
                  ? "Escolha um cursinho para ver os indicadores."
                  : `Como estão os alunos do seu cursinho ${recorte}.`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {podeVerOutros && (
              <SeletorDeCursinho
                cursinhos={cursinhos}
                valor={cursinhoId ?? null}
                onChange={escolher}
                carregando={carregandoCursinhos}
                rotuloDoVazio="Meu cursinho"
                rotulo="Ver os indicadores de"
              />
            )}
            {lista.length > 0 && (
              <div className="flex flex-col gap-1 sm:items-end">
                <Select
                  value={periodoId ?? TODOS}
                  onValueChange={escolherPeriodo}
                >
                  <SelectTrigger
                    aria-label="Período letivo"
                    className="w-full bg-white sm:w-72"
                  >
                    <SelectValue placeholder="Escolha o período letivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TODOS}>Todos os períodos</SelectItem>
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
          </div>
        </header>

        {outro && (
          <p
            role="status"
            className="rounded-xl border border-marine/20 bg-marine/[0.04] px-4 py-3 text-sm text-slate-600"
          >
            Você está vendo os indicadores de <strong>{outro.name}</strong> como
            o cursinho vê. Telefones dos alunos não aparecem.
          </p>
        )}

        {!!periodos?.turmasSemPeriodo && (
          <p className="rounded-xl border border-orange/30 bg-orange/[0.06] px-4 py-3 text-sm text-slate-600">
            {periodos.turmasSemPeriodo === 1
              ? "1 turma sem período letivo não entra nestes números. "
              : `${periodos.turmasSemPeriodo} turmas sem período letivo não entram nestes números. `}
            {/* O link levaria às turmas do PRÓPRIO usuário, não às do cursinho visto (045). */}
            {!outro && (
              <Link
                to={`${DASH}/${PARTNER_CLASS}`}
                className="font-medium text-marine underline-offset-2 hover:underline"
              >
                Ver turmas
              </Link>
            )}
          </p>
        )}

        {semCursinho ? (
          <EscolhaUmCursinho />
        ) : erro ? (
          <PanelError
            retry={periodoId ? carregarIndicadores : carregarPeriodos}
          />
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
    </CursinhoDosIndicadores.Provider>
  );
}

/** Admin sem cursinho próprio (tickets/045). */
function EscolhaUmCursinho() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <p className="font-medium text-marine">Escolha um cursinho</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Você não faz parte de um cursinho. Escolha um no topo para ver os
        indicadores como aquele cursinho vê.
      </p>
    </div>
  );
}

function SemPeriodo() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <p className="font-medium text-marine">
        Nenhum período letivo cadastrado
      </p>
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
