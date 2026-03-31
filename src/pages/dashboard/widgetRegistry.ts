import { WidgetDef } from './types';
import { HeaderWidget } from './components/HeaderWidget';
import { SimuladosWidget } from './components/SimuladosWidget';
import { DesempenhoWidget } from './components/DesempenhoWidget';
import { ProcessosSeletivosWidget } from './components/ProcessosSeletivosWidget';
import { CursinhoStudentWidget } from './components/CursinhoStudentWidget';
import { RedacoesWidget } from './components/RedacoesWidget';
import { CursinhoCollabWidget } from './components/CursinhoCollabWidget';
import { RedacoesRevisarWidget } from './components/RedacoesRevisarWidget';
import { Roles } from '@/enums/roles/roles';

export const widgetRegistry: WidgetDef[] = [
  {
    id: 'header',
    component: HeaderWidget,
    profiles: ['common'],
    gridSpan: { desktop: 3 },
  },
  {
    id: 'simulados',
    component: SimuladosWidget,
    profiles: ['common'],
  },
  {
    id: 'desempenho',
    component: DesempenhoWidget,
    profiles: ['common'],
    gridSpan: { desktop: 2 },
  },
  {
    id: 'processos-seletivos',
    component: ProcessosSeletivosWidget,
    profiles: ['common'],
    excludeProfiles: ['student', 'collaborator'],
  },
  {
    id: 'cursinho-student',
    component: CursinhoStudentWidget,
    profiles: ['student'],
    gridSpan: { desktop: 3 },
  },
  {
    id: 'redacoes',
    component: RedacoesWidget,
    profiles: ['student'],
  },
  {
    id: 'cursinho-collab',
    component: CursinhoCollabWidget,
    profiles: ['collaborator'],
  },
  {
    id: 'redacoes-revisar',
    component: RedacoesRevisarWidget,
    profiles: ['collaborator'],
    permissions: [Roles.revisarRedacoes],
  },
];
