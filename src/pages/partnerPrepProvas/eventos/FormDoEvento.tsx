import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  EventoDoCursinho,
  salvarEvento,
} from "@/services/eventoSimulado";
import { deInputLocal, paraInputLocal } from "./datas";

export type ProvaOpcao = {
  id: string;
  nome: string;
  ano: number | null;
  /** Todas as questões validadas (o "Completa" da lista de provas). */
  completa: boolean;
};

const RESULTADOS_MAX = 20;
/** O mesmo `PROVAS_MAX` da api (`regras-do-evento.ts`). */
export const PROVAS_MAX = 10;
export const TEXTO_MAXIMO_DE_PROVAS = `Máximo de ${PROVAS_MAX} provas por evento.`;
const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const comAno = (p: ProvaOpcao) => (p.ano ? `${p.nome} · ${p.ano}` : p.nome);

type Props = {
  token: string;
  evento: EventoDoCursinho | null;
  provas: ProvaOpcao[];
  onSalvo: () => void;
  onCancelar: () => void;
};

/** Criar/editar evento (tickets/026, card 06). */
export function FormDoEvento({ token, evento, provas, onSalvo, onCancelar }: Props) {
  const [nome, setNome] = useState(evento?.nome ?? "");
  const [descricao, setDescricao] = useState(evento?.descricao ?? "");
  const [de, setDe] = useState(paraInputLocal(evento?.inscricoesDe));
  const [ate, setAte] = useState(paraInputLocal(evento?.inscricoesAte));
  const [escolhidas, setEscolhidas] = useState<string[]>(
    evento?.provas.map((p) => p.provaId) ?? [],
  );
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");

  const porId = useMemo(() => new Map(provas.map((p) => [p.id, p])), [provas]);
  /** Só provas completas entram na busca; as já escolhidas saem dela. */
  const resultados = useMemo(() => {
    const termo = semAcento(busca.trim());
    return provas.filter(
      (p) =>
        p.completa &&
        !escolhidas.includes(p.id) &&
        (!termo || semAcento(p.nome).includes(termo) || String(p.ano ?? "").includes(termo)),
    );
  }, [provas, escolhidas, busca]);

  const janelaInvertida = !!de && !!ate && new Date(de) >= new Date(ate);

  /*
    ⚠️ Card 38: o limite é barrado AQUI, e não só ao salvar — antes a tela
    deixava escolher a 11ª e a api respondia em inglês.
  */
  const noLimite = escolhidas.length >= PROVAS_MAX;

  const adicionar = (id: string) => {
    setEscolhidas((atual) =>
      atual.includes(id) || atual.length >= PROVAS_MAX ? atual : [...atual, id],
    );
    setBusca("");
  };
  const remover = (id: string) =>
    setEscolhidas((atual) => atual.filter((x) => x !== id));

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !de || !ate || !escolhidas.length || janelaInvertida) {
      toast.error("Preencha o nome, a janela de inscrição e escolha pelo menos uma prova.");
      return;
    }
    setSalvando(true);
    try {
      await salvarEvento(
        token,
        {
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          inscricoesDe: deInputLocal(de),
          inscricoesAte: deInputLocal(ate),
          provaIds: escolhidas,
        },
        evento?.id,
      );
      toast.success(evento ? "Evento atualizado" : "Evento criado");
      onSalvo();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar o evento");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="space-y-4">
      <h3 className="text-lg font-semibold text-marine">
        {evento ? "Editar evento" : "Novo evento"}
      </h3>
      <div>
        <label htmlFor="evento-nome" className="block text-sm font-semibold mb-1">
          Nome
        </label>
        <input
          id="evento-nome"
          value={nome}
          maxLength={120}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Simulado de outubro"
          className="w-full border rounded-lg p-2"
        />
      </div>
      <div>
        <label htmlFor="evento-descricao" className="block text-sm font-semibold mb-1">
          Informações para os alunos (opcional)
        </label>
        <textarea
          id="evento-descricao"
          value={descricao}
          maxLength={2000}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Data e local do simulado presencial"
          rows={2}
          className="w-full border rounded-lg p-2"
        />
      </div>
      <fieldset>
        <legend className="block text-sm font-semibold mb-1">Janela de inscrição</legend>
        <p className="text-xs text-grey mb-2">
          Fora deste período os alunos não veem o evento. Quando a janela abre, os
          alunos matriculados recebem uma notificação.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            Início
            <input
              type="datetime-local"
              aria-label="Início das inscrições"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </label>
          <label className="text-sm">
            Fim
            <input
              type="datetime-local"
              aria-label="Fim das inscrições"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </label>
        </div>
        {janelaInvertida && (
          <p role="alert" className="text-xs text-red-600 mt-1">
            O fim das inscrições tem de ser depois do início.
          </p>
        )}
      </fieldset>
      <fieldset>
        <legend className="block text-sm font-semibold mb-1">
          Provas que o aluno pode escolher
        </legend>

        {escolhidas.length > 0 && (
          <ul aria-label="Provas escolhidas" className="flex flex-wrap gap-2 mb-2">
            {escolhidas.map((id) => {
              const p = porId.get(id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-1 rounded-full bg-marine/10 text-marine pl-3 pr-1 py-1 text-sm"
                >
                  <span className="break-words">{p ? comAno(p) : id}</span>
                  <button
                    type="button"
                    onClick={() => remover(id)}
                    aria-label={`Tirar ${p?.nome ?? "prova"}`}
                    className="rounded-full p-1 hover:bg-marine/20"
                  >
                    <FiX aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {noLimite ? (
          <p role="status" className="text-sm text-grey">
            {TEXTO_MAXIMO_DE_PROVAS} Tire uma para escolher outra.
          </p>
        ) : (
          <>
        <div className="relative">
          <FiSearch
            aria-hidden
            className="absolute left-2 top-1/2 -translate-y-1/2 text-grey"
          />
          <input
            type="search"
            aria-label="Buscar prova"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prova pelo nome ou ano"
            className="w-full border rounded-lg p-2 pl-8"
          />
        </div>
        <p className="text-xs text-grey mt-1">
          Só aparecem provas completas (todas as questões validadas).
        </p>

        {provas.length === 0 ? (
          <p className="text-sm text-grey mt-2">Carregando provas...</p>
        ) : resultados.length === 0 ? (
          <p className="text-sm text-grey mt-2">
            {busca.trim() ? "Nenhuma prova completa com esse nome." : "Nenhuma prova completa disponível."}
          </p>
        ) : (
          <ul aria-label="Resultados da busca" className="mt-2 max-h-48 overflow-y-auto border rounded-lg divide-y">
            {resultados.slice(0, RESULTADOS_MAX).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => adicionar(p.id)}
                  className="w-full flex justify-between gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="min-w-0 break-words">{p.nome}</span>
                  <span className="shrink-0 text-grey">{p.ano ?? ""}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {resultados.length > RESULTADOS_MAX && (
          <p className="text-xs text-grey mt-1">
            Mostrando {RESULTADOS_MAX} de {resultados.length}. Refine a busca.
          </p>
        )}
          </>
        )}
      </fieldset>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancelar} className="px-4 py-2 border rounded-lg">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando || janelaInvertida}
          className="px-4 py-2 bg-marine text-white rounded-lg disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
