import { CalendarCheck, TrendingDown, UserCheck } from 'lucide-react';
import { InfoDaMetrica } from '@/components/indicadores/InfoDaMetrica';
import { explicacoes } from '@/pages/indicadoresCursinho/explicacoes';
import {
  evasao,
  frequencia,
  porcentagem,
} from '@/pages/indicadoresCursinho/formato';
import { DASH, PARTNER_INDICADORES } from '@/routes/path';
import { contagem } from '@/services/indicadores';
import { KpiCard } from '../components/KpiCard';
import { useDashData } from '../data';
import { KpiEstudantes } from './kpis';

const LINK = `${DASH}/${PARTNER_INDICADORES}`;

/**
 * Ativos, evasão e frequência do período em andamento (tickets/033, card 10),
 * com o mesmo (i) da tela de Indicadores e levando até ela.
 *
 * ⚠️ Substitui o "Estudantes atendidos" para quem é de um cursinho: aquele
 * número é o da PLATAFORMA, e o colaborador lia como se fosse o dele. Para a
 * equipe do projeto (sem cursinho) o KPI antigo continua.
 */
export function KpisDoCursinho() {
  const { data, isLoading, error, retry } = useDashData('indicadores');

  if (isLoading)
    return <KpiCard icon={UserCheck} label="Ativos" isLoading />;
  if (error)
    return (
      <KpiCard icon={UserCheck} label="Ativos" error={error} retry={retry} />
    );
  if (!data?.cursinho) return <KpiEstudantes />;
  const m = data.metricas;
  // sem período em andamento, não há o que mostrar
  if (!m) return null;

  const alunos = contagem(m, 'alunos');
  const ativos = contagem(m, 'ativos');
  const taxaDeEvasao = evasao(m);
  const freq = contagem(m, 'aulasRegistradas') ? frequencia(m) : null;
  const info = (metrica: string, chave: keyof typeof explicacoes) => (
    <InfoDaMetrica metrica={metrica} explicacao={explicacoes[chave]} />
  );

  return (
    <>
      <KpiCard
        icon={UserCheck}
        tone="green"
        label="Ativos"
        value={ativos ?? '—'}
        hint={alunos !== null ? `de ${alunos} alunos do período` : undefined}
        to={LINK}
        info={info('Ativos', 'ativos')}
      />
      <KpiCard
        icon={TrendingDown}
        tone="red"
        label="Evasão"
        value={porcentagem(taxaDeEvasao) ?? '—'}
        hint="no período em andamento"
        to={LINK}
        info={info('Evasão', 'evasao')}
      />
      <KpiCard
        icon={CalendarCheck}
        label="Frequência média"
        value={porcentagem(freq) ?? '—'}
        hint={freq === null ? 'sem chamadas ainda' : 'presenças ÷ chamadas'}
        to={LINK}
        info={info('Frequência média', 'frequencia')}
      />
    </>
  );
}
