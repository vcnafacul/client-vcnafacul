import {
  CalendarCheck,
  ClipboardList,
  FileEdit,
  GraduationCap,
  HelpCircle,
  PenTool,
  Target,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Roles } from '@/enums/roles/roles';
import {
  DASH,
  DASH_QUESTION,
  ESSAY_HISTORY,
  ESSAY_REVIEW_CURSINHO,
  ESSAY_REVIEW_LIST,
  SIMULADO_HISTORIES,
} from '@/routes/path';
import { KpiCard } from '../components/KpiCard';
import { useDashData } from '../data';
import { essayScore, formatDate, performancePoints, toPercent } from '../format';

export function KpiSimulados() {
  const { data, ...state } = useDashData('performance');
  const historicos = data?.historicos ?? [];
  // Vem ordenado do mais recente para o mais antigo.
  const last = historicos[0];
  return (
    <KpiCard
      {...state}
      icon={ClipboardList}
      label="Simulados feitos"
      value={historicos.length}
      hint={last ? `Último em ${formatDate(last.createdAt)}` : 'Nenhum ainda'}
      to={`${DASH}/${SIMULADO_HISTORIES}`}
    />
  );
}

export function KpiAproveitamento() {
  const { data, ...state } = useDashData('performance');
  const points = performancePoints(data?.historicos ?? []);
  const last = points[points.length - 1];
  const previous = points[points.length - 2];
  return (
    <KpiCard
      {...state}
      icon={Target}
      tone="green"
      label="Aproveitamento médio"
      value={points.length ? `${toPercent(data!.performanceMateriaFrente.geral)}%` : '—'}
      hint={last ? `Último simulado: ${last.value}%` : 'Faça um simulado para medir'}
      delta={
        last && previous
          ? { value: last.value - previous.value, suffix: ' p.p.' }
          : null
      }
    />
  );
}

export function KpiFrequencia() {
  const { data, ...state } = useDashData('student');
  const latest = data?.length ? data[data.length - 1] : null;
  const percentual = latest?.frequencia.percentual ?? 0;
  return (
    <KpiCard
      {...state}
      icon={CalendarCheck}
      tone={percentual >= 75 ? 'green' : percentual >= 50 ? 'orange' : 'red'}
      label="Frequência no cursinho"
      value={latest ? `${percentual}%` : '—'}
      hint={
        latest
          ? `${latest.frequencia.presencas} presenças · ${latest.frequencia.faltas} faltas`
          : 'Nenhuma matrícula ativa'
      }
    />
  );
}

export function KpiRedacoes() {
  const { data, ...state } = useDashData('essays');
  const timeline = data?.stats.timeline ?? [];
  const scored = timeline.map(essayScore).filter((s): s is number => s != null);
  const avg = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : null;
  return (
    <KpiCard
      {...state}
      icon={PenTool}
      tone="orange"
      label="Redações enviadas"
      value={timeline.length}
      hint={avg != null ? `Nota média ${avg}` : 'Sem nota ainda'}
      to={`${DASH}/${ESSAY_HISTORY}`}
    />
  );
}

export function KpiRedacoesRevisar() {
  const isAdmin = useAuthStore(
    (s) => !!s.data.permissao[Roles.revisarTodasRedacoes],
  );
  const { data, ...state } = useDashData(
    isAdmin ? 'essaysToReviewAll' : 'essaysToReview',
  );
  return (
    <KpiCard
      {...state}
      icon={FileEdit}
      tone="orange"
      label="Redações para revisar"
      value={data?.count ?? 0}
      hint={isAdmin ? 'Em toda a plataforma' : 'Do seu cursinho'}
      to={`${DASH}/${isAdmin ? ESSAY_REVIEW_LIST : ESSAY_REVIEW_CURSINHO}`}
    />
  );
}

export function KpiQuestoes() {
  const { data, ...state } = useDashData('questoesPendentes');
  return (
    <KpiCard
      {...state}
      icon={HelpCircle}
      label="Questões para validar"
      value={data?.total ?? 0}
      hint={
        data?.byMateria.length
          ? `Em ${data.byMateria.length} matérias`
          : 'Fila vazia'
      }
      to={`${DASH}/${DASH_QUESTION}`}
    />
  );
}

export function KpiEstudantes() {
  const { data, ...state } = useDashData('studentsServed');
  return (
    <KpiCard
      {...state}
      icon={GraduationCap}
      tone="green"
      label="Estudantes atendidos"
      value={data?.total?.toLocaleString('pt-BR') ?? 0}
      hint="Matriculados efetivamente"
    />
  );
}
