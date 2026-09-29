import { useState } from "react";
import { toast } from "react-toastify";
import {
  EventoDoCursinho,
  salvarEvento,
} from "@/services/eventoSimulado";
import { deInputLocal, paraInputLocal } from "./datas";

type ProvaOpcao = { id: string; nome: string };

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

  const janelaInvertida = !!de && !!ate && new Date(de) >= new Date(ate);

  const alternar = (id: string) =>
    setEscolhidas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );

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
        {provas.length === 0 ? (
          <p className="text-sm text-grey">O cursinho ainda não tem provas.</p>
        ) : (
          <ul className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
            {provas.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escolhidas.includes(p.id)}
                    onChange={() => alternar(p.id)}
                    className="accent-marine"
                  />
                  {p.nome}
                </label>
              </li>
            ))}
          </ul>
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
