import { WidgetDef } from './types';
import { HeaderWidget } from './components/HeaderWidget';
import { SimuladosWidget } from './components/SimuladosWidget';
import { ProcessosSeletivosWidget } from './components/ProcessosSeletivosWidget';
import { CursinhoStudentWidget } from './components/CursinhoStudentWidget';
import { RedacoesWidget } from './components/RedacoesWidget';
import { CursinhoCollabWidget } from './components/CursinhoCollabWidget';
import { RedacoesRevisarWidget } from './components/RedacoesRevisarWidget';
import { QuestoesPendentesWidget } from './components/QuestoesPendentesWidget';
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
    id: 'processos-seletivos',
    component: ProcessosSeletivosWidget,
    profiles: ['common'],
  },
  {
    id: 'cursinho-student',
    component: CursinhoStudentWidget,
    profiles: ['student'],
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
    permissions: [Roles.revisarRedacoes, Roles.revisarTodasRedacoes],
  },
  {
    id: 'questoes-pendentes',
    component: QuestoesPendentesWidget,
    profiles: ['common'],
    permissions: [Roles.validarQuestao],
  },
];
