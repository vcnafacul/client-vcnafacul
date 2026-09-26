import { Roles } from '@/enums/roles/roles';
export type Profile = 'common' | 'student' | 'collaborator';
import {
  KpiAproveitamento,
  KpiEstudantes,
  KpiFrequencia,
  KpiQuestoes,
  KpiRedacoes,
  KpiRedacoesRevisar,
  KpiSimulados,
} from './widgets/kpis';
import { EvolucaoChart } from './widgets/EvolucaoChart';
import { MateriasPanel } from './widgets/MateriasPanel';
import { ProcessosTable } from './widgets/ProcessosTable';
import { QuestoesPanel } from './widgets/QuestoesPanel';
import { MeuCursinho } from './widgets/MeuCursinho';
import { TemaSemana } from './widgets/TemaSemana';
import { CursinhoCollab } from './widgets/CursinhoCollab';

/**
 * Onde o widget aparece:
 * - `kpi`: linha de números no topo (4 por linha no desktop)
 * - `main`: coluna larga (8/12), gráficos e tabelas
 * - `aside`: coluna estreita (4/12), cards de contexto e ação
 * Se uma das colunas ficar vazia para o perfil, a outra ocupa a largura toda.
 */
export type Slot = 'kpi' | 'main' | 'aside';

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
  permissions?: string[];
};

export const widgetRegistry: WidgetDef[] = [
  // --- Estudo
  { id: 'kpi-simulados', view: 'estudo', slot: 'kpi', component: KpiSimulados, profiles: ['common'] },
  { id: 'kpi-aproveitamento', view: 'estudo', slot: 'kpi', component: KpiAproveitamento, profiles: ['common'] },
  { id: 'kpi-frequencia', view: 'estudo', slot: 'kpi', component: KpiFrequencia, profiles: ['student'] },
  { id: 'kpi-redacoes', view: 'estudo', slot: 'kpi', component: KpiRedacoes, profiles: ['student'] },
  { id: 'evolucao', view: 'estudo', slot: 'main', component: EvolucaoChart, profiles: ['common'] },
  { id: 'processos', view: 'estudo', slot: 'main', component: ProcessosTable, profiles: ['common'] },
  { id: 'tema-semana', view: 'estudo', slot: 'aside', component: TemaSemana, profiles: ['student'] },
  { id: 'meu-cursinho', view: 'estudo', slot: 'aside', component: MeuCursinho, profiles: ['student'] },
  { id: 'materias', view: 'estudo', slot: 'aside', component: MateriasPanel, profiles: ['common'] },

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
    id: 'kpi-estudantes',
    view: 'atuacao',
    slot: 'kpi',
    component: KpiEstudantes,
    profiles: ['common'],
    permissions: [Roles.visualizarEstudantes, Roles.gerenciarEstudantes],
  },
  {
    id: 'questoes',
    view: 'atuacao',
    slot: 'main',
    component: QuestoesPanel,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
  { id: 'cursinho-collab', view: 'atuacao', slot: 'aside', component: CursinhoCollab, profiles: ['collaborator'] },
];

export function visibleWidgets(
  widgets: WidgetDef[],
  profiles: string[],
  permissions: Record<string, boolean>,
) {
  return widgets.filter(
    (w) =>
      w.profiles.some((p) => profiles.includes(p)) &&
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
