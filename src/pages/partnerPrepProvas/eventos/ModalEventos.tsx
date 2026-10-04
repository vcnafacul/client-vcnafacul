import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getProvasCursinho } from "@/services/prova/getProvasCursinho";
import { statusDaProva, STATUS_COMPLETA } from "@/pages/dashProvas/status";
import { ProvaOpcao } from "./FormDoEvento";
import {
  EventoDoCursinho,
  excluirEvento,
  listarEventos,
  StatusDoEvento,
} from "@/services/eventoSimulado";
import { formatarDataHora } from "./datas";
import { FormDoEvento } from "./FormDoEvento";
import { PainelDoEvento } from "./PainelDoEvento";
import { textoDaExclusao } from "./textoDaExclusao";

const ROTULO: Record<StatusDoEvento, { texto: string; cor: string }> = {
  agendado: { texto: "Agendado", cor: "bg-blue-100 text-blue-800" },
  aberto: { texto: "Inscrições abertas", cor: "bg-green-100 text-green-800" },
  encerrado: { texto: "Encerrado", cor: "bg-gray-200 text-gray-700" },
};

type Tela =
  | { tipo: "lista" }
  | { tipo: "form"; evento: EventoDoCursinho | null }
  | { tipo: "painel"; evento: EventoDoCursinho };

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  token: string;
  podeEditar: boolean;
};

/**
 * ⚠️ As provas vêm daqui, e não da lista da tela: aquela é paginada (rolagem)
 * e deixaria de fora provas que ainda não carregaram. Aqui busca TODAS as
 * páginas — com a busca por nome, prova que não veio é prova que "não existe".
 */
const POR_PAGINA = 100;
const PAGINAS_MAX = 50;

async function todasAsProvas(token: string): Promise<ProvaOpcao[]> {
  const out: ProvaOpcao[] = [];
  for (let page = 1; page <= PAGINAS_MAX; page++) {
    const r = await getProvasCursinho(token, page, POR_PAGINA);
    out.push(
      ...r.data.map((p) => ({
        id: p._id,
        nome: p.nome,
        ano: p.ano ?? null,
        // "Completa" é o mesmo rótulo da lista de provas: tudo validado.
        completa: statusDaProva(p) === STATUS_COMPLETA,
      })),
    );
    if (!r.data.length || out.length >= (r.totalItems ?? 0)) break;
  }
  return out;
}

/** Eventos de simulado presencial na tela de provas (tickets/026, card 06). */
export function ModalEventos({ isOpen, handleClose, token, podeEditar }: Props) {
  const [tela, setTela] = useState<Tela>({ tipo: "lista" });
  const [eventos, setEventos] = useState<EventoDoCursinho[] | null>(null);
  const [provas, setProvas] = useState<ProvaOpcao[]>([]);

  const carregar = useCallback(() => {
    listarEventos(token)
      .then(setEventos)
      .catch((e: Error) => {
        toast.error(e.message);
        setEventos([]);
      });
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      setTela({ tipo: "lista" });
      carregar();
    }
  }, [isOpen, carregar]);

  useEffect(() => {
    if (!isOpen || !podeEditar) return;
    todasAsProvas(token)
      .then(setProvas)
      .catch(() => setProvas([]));
  }, [isOpen, podeEditar, token]);

  /** As do cursinho + as que o evento já tem (mesmo que não venham na lista). */
  const opcoesPara = (evento: EventoDoCursinho | null): ProvaOpcao[] => {
    const extras = (evento?.provas ?? [])
      .filter((p) => !provas.some((o) => o.id === p.provaId))
      .map((p) => ({ id: p.provaId, nome: p.nome, ano: null, completa: false }));
    return [...provas, ...extras];
  };

  const excluir = async (e: EventoDoCursinho) => {
    if (!window.confirm(textoDaExclusao(e))) return;
    try {
      await excluirEvento(token, e.id);
      toast.success("Evento excluído");
      carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-2xl rounded-lg bg-white shadow-xl p-2"
    >
      <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
        {tela.tipo === "lista" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-marine">Eventos de simulado</h2>
              {podeEditar && (
                <button
                  type="button"
                  onClick={() => setTela({ tipo: "form", evento: null })}
                  className="px-4 py-2 bg-marine text-white rounded-lg text-sm"
                >
                  Novo evento
                </button>
              )}
            </div>
            <p className="text-xs text-grey">
              Os alunos matriculados se inscrevem escolhendo a prova. Use o número de
              inscritos de cada prova para saber quanto imprimir.
            </p>
            {eventos === null && <p className="text-sm">Carregando...</p>}
            {eventos?.length === 0 && (
              <p className="text-sm text-grey">Nenhum evento ainda.</p>
            )}
            <ul className="space-y-2">
              {eventos?.map((e) => (
                <li key={e.id} className="border rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold break-words min-w-0">{e.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ROTULO[e.status].cor}`}>
                      {ROTULO[e.status].texto}
                    </span>
                  </div>
                  <p className="text-xs text-grey mt-1">
                    Inscrições: {formatarDataHora(e.inscricoesDe)} até{" "}
                    {formatarDataHora(e.inscricoesAte)}
                  </p>
                  <p className="text-sm mt-1">
                    {e.provas.map((p) => `${p.nome}: ${p.inscritos}`).join(" · ")} —{" "}
                    <strong>{e.totalInscritos}</strong> inscritos
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setTela({ tipo: "painel", evento: e })}
                      className="text-marine hover:underline"
                    >
                      Ver inscritos e engajamento
                    </button>
                    {podeEditar && (
                      <>
                        <button
                          type="button"
                          onClick={() => setTela({ tipo: "form", evento: e })}
                          className="text-marine hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => excluir(e)}
                          className="text-red-600 hover:underline"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tela.tipo === "form" && (
          <FormDoEvento
            token={token}
            evento={tela.evento}
            provas={opcoesPara(tela.evento)}
            onSalvo={() => {
              setTela({ tipo: "lista" });
              carregar();
            }}
            onCancelar={() => setTela({ tipo: "lista" })}
          />
        )}
        {tela.tipo === "painel" && (
          <PainelDoEvento
            token={token}
            evento={tela.evento}
            onVoltar={() => setTela({ tipo: "lista" })}
          />
        )}
      </div>
    </ModalTemplate>
  );
}
