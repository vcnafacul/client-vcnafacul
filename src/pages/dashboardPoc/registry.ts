import { Roles } from '@/enums/roles/roles';
import { Profile } from '../dashboard/types';
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
 * KPIs de quem estuda × KPIs de quem trabalha na plataforma. Só vira dois
 * blocos com título quando o usuário tem os dois; senão é uma linha só.
 */
export type KpiGroup = 'estudo' | 'gestao';

export type PocWidget = {
  id: string;
  slot: Slot;
  group?: KpiGroup;
  component: React.ComponentType;
  profiles: Profile[];
  permissions?: string[];
};

export const pocRegistry: PocWidget[] = [
  { id: 'kpi-simulados', slot: 'kpi', group: 'estudo', component: KpiSimulados, profiles: ['common'] },
  { id: 'kpi-aproveitamento', slot: 'kpi', group: 'estudo', component: KpiAproveitamento, profiles: ['common'] },
  { id: 'kpi-frequencia', slot: 'kpi', group: 'estudo', component: KpiFrequencia, profiles: ['student'] },
  { id: 'kpi-redacoes', slot: 'kpi', group: 'estudo', component: KpiRedacoes, profiles: ['student'] },
  {
    id: 'kpi-redacoes-revisar',
    slot: 'kpi',
    group: 'gestao',
    component: KpiRedacoesRevisar,
    profiles: ['collaborator'],
    permissions: [Roles.revisarRedacoes, Roles.revisarTodasRedacoes],
  },
  {
    id: 'kpi-questoes',
    slot: 'kpi',
    group: 'gestao',
    component: KpiQuestoes,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
  {
    id: 'kpi-estudantes',
    slot: 'kpi',
    group: 'gestao',
    component: KpiEstudantes,
    profiles: ['common'],
    permissions: [Roles.visualizarEstudantes, Roles.gerenciarEstudantes],
  },

  { id: 'evolucao', slot: 'main', component: EvolucaoChart, profiles: ['common'] },
  {
    id: 'questoes',
    slot: 'main',
    component: QuestoesPanel,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
  { id: 'processos', slot: 'main', component: ProcessosTable, profiles: ['common'] },

  { id: 'tema-semana', slot: 'aside', component: TemaSemana, profiles: ['student'] },
  { id: 'meu-cursinho', slot: 'aside', component: MeuCursinho, profiles: ['student'] },
  { id: 'cursinho-collab', slot: 'aside', component: CursinhoCollab, profiles: ['collaborator'] },
  { id: 'materias', slot: 'aside', component: MateriasPanel, profiles: ['common'] },
];

export function visibleWidgets(
  widgets: PocWidget[],
  profiles: string[],
  permissions: Record<string, boolean>,
) {
  return widgets.filter(
    (w) =>
      w.profiles.some((p) => profiles.includes(p)) &&
      (!w.permissions?.length || w.permissions.some((p) => permissions[p])),
  );
}
