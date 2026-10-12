import { useEffect, useState } from "react";
import {
  EngajamentoDoEvento,
  engajamentoDoEvento,
  EventoDoCursinho,
} from "@/services/eventoSimulado";

type Props = { token: string; evento: EventoDoCursinho; onVoltar: () => void };

/** Inscritos, quem fez e engajamento (tickets/026, card 06; por simulado na 039). */
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
  /**
   * tickets/039: os simulados de cada prova que tem mais de um (Enem Dia 1). Só
   * essas são quebradas por simulado; as outras seguem como antes.
   */
  const simuladosDa = (provaId: string) => {
    const s = dados?.porProva.find((p) => p.provaId === provaId)?.simulados;
    return s && s.length > 1 ? s : [];
  };
  /** O nome do que o aluno escolheu (ou fez): o simulado, se a prova tiver vários. */
  const nomeDaOpcao = (provaId: string, simuladoId?: string | null) =>
    simuladosDa(provaId).find((s) => s.simuladoId === simuladoId)?.nome ??
    nomeDaProva(provaId);
  type Inscrito = EngajamentoDoEvento["inscritos"][number];
  /** Card 38: inscrito numa prova, fez outra. 039: ou a outra língua. */
  const trocouDeProva = (i: Inscrito) =>
    i.fez && !!i.provaQueFez && i.provaQueFez !== i.provaId;
  const trocouDeLingua = (i: Inscrito) =>
    i.fez &&
    !trocouDeProva(i) &&
    !!i.simuladoId &&
    !!i.simuladoQueFez &&
    i.simuladoQueFez !== i.simuladoId;
  const temQuebra = !!dados?.porProva.some((p) => simuladosDa(p.provaId).length);

  // Filtro: `<provaId>` (a prova toda) ou `sim:<simuladoId>`.
  const lista = dados?.inscritos.filter((i) =>
    filtro === "todas"
      ? true
      : filtro.startsWith("sim:")
        ? i.simuladoId === filtro.slice(4)
        : i.provaId === filtro,
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
                  <th className="py-1 pr-2">Trocaram de prova</th>
                  <th className="py-1">Não vieram</th>
                </tr>
              </thead>
              <tbody>
                {dados.porProva.map((p) => {
                  const sims = simuladosDa(p.provaId);
                  if (!sims.length) {
                    return (
                      <tr key={p.provaId} className="border-t">
                        <td className="py-1 pr-2">{p.nome}</td>
                        <td className="py-1 pr-2 font-semibold">{p.inscritos}</td>
                        <td className="py-1 pr-2">{p.fizeram}</td>
                        <td className="py-1 pr-2">{p.trocaram}</td>
                        <td className="py-1">{p.naoVieram}</td>
                      </tr>
                    );
                  }
                  /*
                    tickets/039 (D2): uma linha por simulado e o total da prova —
                    o total é o que se imprime do caderno da prova; as linhas,
                    quantos de cada língua.
                  */
                  return [
                    ...sims.map((s) => (
                      <tr key={s.simuladoId} className="border-t">
                        <td className="py-1 pr-2">{s.nome}</td>
                        <td className="py-1 pr-2">{s.inscritos}</td>
                        <td className="py-1 pr-2">{s.fizeram}</td>
                        <td className="py-1 pr-2">{s.trocaram}</td>
                        <td className="py-1">{s.naoVieram}</td>
                      </tr>
                    )),
                    <tr
                      key={`${p.provaId}-total`}
                      data-slot="total-da-prova"
                      className="border-t bg-gray-50"
                    >
                      <td className="py-1 pr-2 font-medium">
                        Total — {p.nome}
                        {!!p.semSimulado && (
                          <span className="block text-xs font-normal text-grey">
                            inclui {p.semSimulado} sem língua escolhida
                          </span>
                        )}
                      </td>
                      <td className="py-1 pr-2 font-semibold">{p.inscritos}</td>
                      <td className="py-1 pr-2">{p.fizeram}</td>
                      <td className="py-1 pr-2">{p.trocaram}</td>
                      <td className="py-1">{p.naoVieram}</td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
            {/*
              ⚠️ Card 38: "Fizeram" conta na prova que o aluno FEZ, e por isso
              pode passar dos inscritos. É o número que serve para a conta de
              cadernos do próximo evento.
            */}
            <p className="text-xs text-grey mt-1">
              "Fizeram" conta na prova que o aluno fez, mesmo inscrito em outra.
              {temQuebra &&
                " Na prova com Inglês e Espanhol, trocar de língua também conta como troca."}
            </p>
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
                {evento.provas.flatMap((p) => [
                  <option key={p.provaId} value={p.provaId}>
                    {p.nome}
                  </option>,
                  ...simuladosDa(p.provaId).map((s) => (
                    <option key={s.simuladoId} value={`sim:${s.simuladoId}`}>
                      {`  ${s.nome}`}
                    </option>
                  )),
                ])}
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
                      {nomeDaOpcao(i.provaId, i.simuladoId)} ·{" "}
                      {trocouDeProva(i) ? (
                        <span className="font-medium text-amber-700">
                          fez outra prova (
                          {nomeDaOpcao(i.provaQueFez!, i.simuladoQueFez)})
                        </span>
                      ) : trocouDeLingua(i) ? (
                        <span className="font-medium text-amber-700">
                          fez outro simulado (
                          {nomeDaOpcao(i.provaId, i.simuladoQueFez)})
                        </span>
                      ) : i.fez ? (
                        "fez"
                      ) : (
                        "não fez"
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-grey">
                {filtro === "todas"
                  ? "Ninguém inscrito ainda."
                  : "Ninguém inscrito nesta prova."}
              </p>
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
                      {nomeDaOpcao(i.provaId, i.simuladoId)}
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
