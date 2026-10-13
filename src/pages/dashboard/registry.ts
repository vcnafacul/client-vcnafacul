import { Roles } from '@/enums/roles/roles';
export type Profile = 'common' | 'student' | 'collaborator';
import {
  KpiAproveitamento,
  KpiFrequencia,
  KpiQuestoes,
  KpiRedacoes,
  KpiRedacoesRevisar,
  KpiSimulados,
} from './widgets/kpis';
import { KpisDoCursinho } from './widgets/KpisDoCursinho';
import { EvolucaoChart } from './widgets/EvolucaoChart';
import { MateriasPanel } from './widgets/MateriasPanel';
import { ProcessosTable } from './widgets/ProcessosTable';
import { QuestoesPanel } from './widgets/QuestoesPanel';
import { MeuCursinho } from './widgets/MeuCursinho';
import { SimuladoDoCursinho } from './widgets/SimuladoDoCursinho';
import { TemaSemana } from './widgets/TemaSemana';
import { CursinhoCollab } from './widgets/CursinhoCollab';

/**
 * Onde o widget aparece:
 * - `kpi`: linha de números no topo (4 por linha no desktop)
 * - `body`: os blocos abaixo, em linhas — ver `span` e `grow`
 */
export type Slot = 'kpi' | 'body';

/** Largura do bloco no desktop, em colunas de 12. */
export type Span = 4 | 8 | 12;

/**
 * A qual visão o widget pertence. Quem trabalha na plataforma vê só a de
 * atuação; se também for aluno matriculado, alterna para a de estudo.
 */
export type View = 'estudo' | 'atuacao';

export type WidgetDef = {
  id: string;
  slot: Slot;
  view: View;
  component: React.ComponentType;
  profiles: Profile[];
  /** Só em `body`. Os blocos seguem na ordem do registry, quebrando linha. */
  span?: Span;
  /**
   * Só em `body`: ocupa o que sobrar na linha. É o que deixa a linha cheia
   * quando um vizinho não aparece (perfil, ou o widget que some sozinho).
   */
  grow?: boolean;
  /** Some para quem tem algum destes perfis, mesmo passando em `profiles`. */
  hiddenFor?: Profile[];
  permissions?: string[];
};

export const widgetRegistry: WidgetDef[] = [
  // --- Estudo
  { id: 'kpi-simulados', view: 'estudo', slot: 'kpi', component: KpiSimulados, profiles: ['common'] },
  { id: 'kpi-aproveitamento', view: 'estudo', slot: 'kpi', component: KpiAproveitamento, profiles: ['common'] },
  { id: 'kpi-frequencia', view: 'estudo', slot: 'kpi', component: KpiFrequencia, profiles: ['student'] },
  { id: 'kpi-redacoes', view: 'estudo', slot: 'kpi', component: KpiRedacoes, profiles: ['student'] },
  // Matriculado: [Evolução 8 | Tema 4] · [Meu cursinho 4 | Por matéria 8]
  // (com evento: [Simulado 4 | Meu cursinho 4 | Por matéria 4]).
  // Sem matrícula: [Evolução 8 | Por matéria 4] · [Processos 12].
  { id: 'evolucao', view: 'estudo', slot: 'body', span: 8, grow: true, component: EvolucaoChart, profiles: ['common'] },
  { id: 'tema-semana', view: 'estudo', slot: 'body', span: 4, component: TemaSemana, profiles: ['student'] },
  // tickets/026: some sozinho sem evento aberto.
  { id: 'simulado-do-cursinho', view: 'estudo', slot: 'body', span: 4, component: SimuladoDoCursinho, profiles: ['student'] },
  { id: 'meu-cursinho', view: 'estudo', slot: 'body', span: 4, component: MeuCursinho, profiles: ['student'] },
  { id: 'materias', view: 'estudo', slot: 'body', span: 4, grow: true, component: MateriasPanel, profiles: ['common'] },
  // Quem tem matrícula ativa (`student`) não pode ter outra (tickets/035): não
  // oferecer processo seletivo. Some até a matrícula encerrar.
  { id: 'processos', view: 'estudo', slot: 'body', span: 12, component: ProcessosTable, profiles: ['common'], hiddenFor: ['student'] },

  // --- Atuação
  {
    id: 'kpi-redacoes-revisar',
    view: 'atuacao',
    slot: 'kpi',
    component: KpiRedacoesRevisar,
    profiles: ['collaborator'],
    permissions: [Roles.revisarRedacoes, Roles.revisarTodasRedacoes],
  },
  {
    id: 'kpi-questoes',
    view: 'atuacao',
    slot: 'kpi',
    component: KpiQuestoes,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
  {
    // tickets/033: ativos, evasão e frequência do cursinho; para quem não é
    // de cursinho, continua o "Estudantes atendidos" (total da plataforma)
    id: 'kpi-estudantes',
    view: 'atuacao',
    slot: 'kpi',
    component: KpisDoCursinho,
    profiles: ['common'],
    permissions: [Roles.visualizarEstudantes, Roles.gerenciarEstudantes],
  },
  {
    id: 'questoes',
    view: 'atuacao',
    slot: 'body',
    span: 8,
    grow: true,
    component: QuestoesPanel,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
  { id: 'cursinho-collab', view: 'atuacao', slot: 'body', span: 4, grow: true, component: CursinhoCollab, profiles: ['collaborator'] },
];

export function visibleWidgets(
  widgets: WidgetDef[],
  profiles: string[],
  permissions: Record<string, boolean>,
) {
  return widgets.filter(
    (w) =>
      w.profiles.some((p) => profiles.includes(p)) &&
      !w.hiddenFor?.some((p) => profiles.includes(p)) &&
      (!w.permissions?.length || w.permissions.some((p) => permissions[p])),
  );
}

/**
 * Visões que o usuário pode abrir, na ordem de preferência.
 *
 * Atuação existe se algum widget de atuação passou no filtro — não basta o
 * perfil `collaborator`: um admin com `validarQuestao` que não colabora em
 * cursinho também trabalha na plataforma. Estudo existe para o aluno
 * matriculado (`student`) ou para quem não tem atuação nenhuma (todo usuário
 * comum cai aqui).
 */
export function availableViews(
  visible: WidgetDef[],
  profiles: string[],
): View[] {
  const hasAtuacao = visible.some((w) => w.view === 'atuacao');
  const hasEstudo = profiles.includes('student') || !hasAtuacao;
  return [
    ...(hasAtuacao ? (['atuacao'] as const) : []),
    ...(hasEstudo ? (['estudo'] as const) : []),
  ];
}
