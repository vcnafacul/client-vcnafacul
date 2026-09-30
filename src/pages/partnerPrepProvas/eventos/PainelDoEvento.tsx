import { useEffect, useState } from "react";
import {
  EngajamentoDoEvento,
  engajamentoDoEvento,
  EventoDoCursinho,
} from "@/services/eventoSimulado";

type Props = { token: string; evento: EventoDoCursinho; onVoltar: () => void };

/** Inscritos, quem fez e engajamento (tickets/026, card 06). */
export function PainelDoEvento({ token, evento, onVoltar }: Props) {
  const [dados, setDados] = useState<EngajamentoDoEvento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todas");

  useEffect(() => {
    engajamentoDoEvento(token, evento.id)
      .then(setDados)
      .catch((e: Error) => setErro(e.message));
  }, [token, evento.id]);

  const nomeDaProva = (id: string) =>
    evento.provas.find((p) => p.provaId === id)?.nome ?? "";

  const lista = dados?.inscritos.filter(
    (i) => filtro === "todas" || i.provaId === filtro,
  );

  return (
    <div className="space-y-4">
      <button type="button" onClick={onVoltar} className="text-sm text-marine hover:underline">
        ← Voltar para os eventos
      </button>
      <h3 className="text-lg font-semibold text-marine">{evento.nome}</h3>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {!dados && !erro && <p className="text-sm">Carregando...</p>}
      {dados && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Números por prova">
              <thead>
                <tr className="text-left text-grey">
                  <th className="py-1 pr-2">Prova</th>
                  <th className="py-1 pr-2">Inscritos (imprimir)</th>
                  <th className="py-1 pr-2">Fizeram</th>
                  <th className="py-1">Não vieram</th>
                </tr>
              </thead>
              <tbody>
                {dados.porProva.map((p) => (
                  <tr key={p.provaId} className="border-t">
                    <td className="py-1 pr-2">{p.nome}</td>
                    <td className="py-1 pr-2 font-semibold">{p.inscritos}</td>
                    <td className="py-1 pr-2">{p.fizeram}</td>
                    <td className="py-1">{p.naoVieram}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-xs text-grey">Engajamento</p>
              <p className="text-xl font-bold text-marine">
                {dados.engajamento === null
                  ? "—"
                  : `${Math.round(dados.engajamento * 100)}%`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-xs text-grey">Fizeram sem se inscrever</p>
              <p className="text-xl font-bold text-marine">
                {dados.fizeramSemInscricao.length}
              </p>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm">Inscritos</h4>
              <select
                aria-label="Filtrar por prova"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="border rounded p-1 text-sm w-full sm:w-auto max-w-full"
              >
                <option value="todas">Todas as provas</option>
                {evento.provas.map((p) => (
                  <option key={p.provaId} value={p.provaId}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            {lista?.length ? (
              <ul className="divide-y text-sm" aria-label="Lista de inscritos">
                {lista.map((i, k) => (
                  <li
                    key={k}
                    className="flex flex-col sm:flex-row sm:justify-between gap-x-2 py-1"
                  >
                    <span className="min-w-0 break-words">{i.nome}</span>
                    <span className="text-grey sm:shrink-0 sm:text-right break-words">
                      {nomeDaProva(i.provaId)} · {i.fez ? "fez" : "não fez"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-grey">Ninguém inscrito ainda.</p>
            )}
          </div>
          {dados.fizeramSemInscricao.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Fizeram sem se inscrever</h4>
              <ul className="divide-y text-sm">
                {dados.fizeramSemInscricao.map((i, k) => (
                  <li
                    key={k}
                    className="flex flex-col sm:flex-row sm:justify-between gap-x-2 py-1"
                  >
                    <span className="min-w-0 break-words">{i.nome}</span>
                    <span className="text-grey sm:shrink-0 sm:text-right break-words">
                      {nomeDaProva(i.provaId)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
