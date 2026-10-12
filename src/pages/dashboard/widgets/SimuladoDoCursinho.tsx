import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth';
import {
  desistirDoEvento,
  EventoParaOAluno,
  inscreverNoEvento,
  meusEventos,
  OpcaoDoEvento,
} from '@/services/eventoSimulado';
import { Panel } from '../components/Panel';

/**
 * tickets/039: o aluno escolhe o SIMULADO. Sem `opcoes` (api de antes), cada
 * prova é uma opção, como sempre foi.
 */
const opcoesDo = (e: EventoParaOAluno): OpcaoDoEvento[] =>
  e.opcoes ??
  e.provas.map((p) => ({ provaId: p.provaId, simuladoId: null, nome: p.nome }));

const chave = (provaId: string, simuladoId?: string | null) =>
  `${provaId}|${simuladoId ?? ''}`;

const ate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

function CardDoEvento({
  evento,
  token,
  onMudou,
}: {
  evento: EventoParaOAluno;
  token: string;
  onMudou: (e: EventoParaOAluno) => void;
}) {
  const opcoes = opcoesDo(evento);
  const inscrito = evento.minhaProvaId !== null;
  const minha = inscrito ? chave(evento.minhaProvaId!, evento.meuSimuladoId) : '';
  const [escolhida, setEscolhida] = useState<string>(
    minha ||
      (opcoes.length === 1 ? chave(opcoes[0].provaId, opcoes[0].simuladoId) : ''),
  );
  const [ocupado, setOcupado] = useState(false);
  const opcaoDa = (k: string) =>
    opcoes.find((o) => chave(o.provaId, o.simuladoId) === k);
  // Inscrição de antes, numa prova de vários simulados: sem a língua, vale o
  // nome da prova.
  const nomeDa = (k: string) =>
    opcaoDa(k)?.nome ??
    evento.provas.find((p) => p.provaId === k.split('|')[0])?.nome ??
    '';
  const variasOpcoes = opcoes.length > 1;

  const inscrever = async () => {
    const opcao = opcaoDa(escolhida);
    if (!opcao) {
      toast.error('Escolha o simulado que você vai fazer.');
      return;
    }
    setOcupado(true);
    try {
      const r = await inscreverNoEvento(
        token,
        evento.id,
        opcao.provaId,
        opcao.simuladoId ?? undefined,
      );
      onMudou(r.evento);
      if (r.resultado === 'nova') toast.success('Inscrição confirmada!');
      if (r.resultado === 'troca') toast.success(`Agora você vai fazer ${nomeDa(escolhida)}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao se inscrever');
    } finally {
      setOcupado(false);
    }
  };

  const desistir = async () => {
    if (!window.confirm(`Desistir de "${evento.nome}"?`)) return;
    setOcupado(true);
    try {
      await desistirDoEvento(token, evento.id);
      onMudou({ ...evento, minhaProvaId: null, meuSimuladoId: null });
      toast.success('Inscrição cancelada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desistir');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Panel title="Simulado do cursinho" subtitle={evento.cursinho}>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-base font-semibold text-marine break-words">{evento.nome}</p>
          {evento.descricao && (
            <p className="text-slate-600 whitespace-pre-line break-words">{evento.descricao}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">Inscrições até {ate(evento.inscricoesAte)}</p>
        </div>

        {inscrito && (
          <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
            Você está inscrito em <strong>{nomeDa(minha)}</strong>.
          </p>
        )}

        {variasOpcoes && (
          <fieldset>
            <legend className="mb-1 font-medium">
              {inscrito ? 'Trocar de simulado' : 'Qual simulado você vai fazer?'}
            </legend>
            <div className="space-y-1">
              {opcoes.map((o) => {
                const k = chave(o.provaId, o.simuladoId);
                return (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`opcao-${evento.id}`}
                      checked={escolhida === k}
                      onChange={() => setEscolhida(k)}
                      className="accent-marine"
                    />
                    {o.nome}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2">
          {!inscrito && (
            <button
              type="button"
              onClick={inscrever}
              disabled={ocupado}
              className="rounded-lg bg-marine px-4 py-2 text-white disabled:opacity-60"
            >
              Quero fazer
            </button>
          )}
          {inscrito && variasOpcoes && escolhida !== minha && (
            <button
              type="button"
              onClick={inscrever}
              disabled={ocupado}
              className="rounded-lg bg-marine px-4 py-2 text-white disabled:opacity-60"
            >
              Trocar para {nomeDa(escolhida)}
            </button>
          )}
          {inscrito && (
            <button
              type="button"
              onClick={desistir}
              disabled={ocupado}
              className="rounded-lg border px-4 py-2 text-slate-700 disabled:opacity-60"
            >
              Desistir
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}

/**
 * Card do evento de simulado presencial (tickets/026, card 07). Só aparece
 * com evento aberto num cursinho em que o aluno está matriculado — a api
 * decide. Sem evento (ou com erro ao buscar), não ocupa espaço.
 */
export function SimuladoDoCursinho() {
  const token = useAuthStore((s) => s.data.token);
  const [eventos, setEventos] = useState<EventoParaOAluno[]>([]);

  useEffect(() => {
    meusEventos(token)
      .then(setEventos)
      .catch(() => setEventos([]));
  }, [token]);

  const atualizar = useCallback(
    (e: EventoParaOAluno) =>
      setEventos((lista) => lista.map((x) => (x.id === e.id ? e : x))),
    [],
  );

  if (!eventos.length) return null;
  return (
    <>
      {eventos.map((e) => (
        <CardDoEvento key={e.id} evento={e} token={token} onMudou={atualizar} />
      ))}
    </>
  );
}
