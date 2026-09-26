import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Roles } from '@/enums/roles/roles';
import DashboardPoc from '.';

const auth = {
  data: {
    token: 'fake-token',
    user: { firstName: 'Ana', lastName: 'Souza', useSocialName: false },
    profiles: [] as string[],
    permissao: {} as Record<string, boolean>,
  },
};

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (s: typeof auth) => unknown) => selector(auth),
}));

const getPerformance = vi.fn();
vi.mock('@/services/historico/getPerformance', () => ({
  getPerformance: () => getPerformance(),
}));

vi.mock('@/services/essay', () => ({
  getMyStats: () =>
    Promise.resolve({
      timeline: [
        { essayId: '1', aiReview: { totalScore: 600 }, humanReview: null },
        { essayId: '2', aiReview: { totalScore: 600 }, humanReview: { totalScore: 800 } },
      ],
    }),
  getCurrentTheme: () =>
    Promise.resolve({ id: 't', title: 'Desafios da mobilidade urbana', weekEnd: '2026-10-02' }),
}));

vi.mock('@/services/dashboard', () => ({
  getStudentDashboard: () =>
    Promise.resolve([
      {
        cursinho: { name: 'Cursinho Alfa', logo: null },
        matricula: '123',
        turma: 'Turma A',
        periodo: null,
        frequencia: { presencas: 18, faltas: 2, percentual: 90 },
      },
    ]),
  getCollaboratorDashboard: () =>
    Promise.resolve({ cursinho: { name: 'Cursinho Beta', logo: null }, frentes: [] }),
  getOpenInscriptions: () => Promise.resolve([]),
  getQuestoesPendentes: () =>
    Promise.resolve({
      total: 7,
      byMateria: [{ materiaId: 'm', materiaName: 'Física', count: 7 }],
    }),
  getEssayCountForReview: () => Promise.resolve({ count: 3 }),
  getEssayCountForReviewAll: () => Promise.resolve({ count: 40 }),
  getStudentsServed: () => Promise.resolve({ total: 1234 }),
}));

function performance() {
  // O ms-simulado devolve do mais recente para o mais antigo.
  return {
    performanceMateriaFrente: {
      geral: 0.55,
      materias: [{ id: 'mat', nome: 'Matemática', aproveitamento: 0.4 }],
      frentes: [],
    },
    historicos: [
      { historyId: 'b', testName: 'ENEM 2', performance: { geral: 0.7 }, createdAt: '2026-09-20' },
      { historyId: 'a', testName: 'ENEM 1', performance: { geral: 0.4 }, createdAt: '2026-09-01' },
    ],
  };
}

function renderPoc() {
  return render(
    <MemoryRouter>
      <DashboardPoc />
    </MemoryRouter>,
  );
}

function kpi(label: string) {
  return screen.getByText(label).closest('a, div.rounded-2xl') as HTMLElement;
}

beforeEach(() => {
  getPerformance.mockReset().mockResolvedValue(performance());
  auth.data.profiles = [];
  auth.data.permissao = {};
});

describe('DashboardPoc', () => {
  it('estudante vê KPIs pessoais, frequência e tema da semana', async () => {
    auth.data.profiles = ['common', 'student'];
    renderPoc();

    expect(await screen.findByText('Desafios da mobilidade urbana')).toBeInTheDocument();
    expect(within(kpi('Simulados feitos')).getByText('2')).toBeInTheDocument();
    // Média vem do backend; a variação compara o último simulado com o anterior.
    expect(within(kpi('Aproveitamento médio')).getByText('55%')).toBeInTheDocument();
    expect(within(kpi('Aproveitamento médio')).getByText(/\+30/)).toBeInTheDocument();
    // Revisão humana tem precedência sobre a da IA: (600 + 800) / 2.
    expect(within(kpi('Redações enviadas')).getByText('Nota média 700')).toBeInTheDocument();
    expect(await screen.findByText('Meu cursinho')).toBeInTheDocument();
    expect(screen.queryByText('Redações para revisar')).not.toBeInTheDocument();
  });

  it('colaborador só vê o que a permissão libera', async () => {
    auth.data.profiles = ['common', 'collaborator'];
    auth.data.permissao = { [Roles.validarQuestao]: true };
    renderPoc();

    expect(await screen.findByText('Fila de validação')).toBeInTheDocument();
    expect(await screen.findByText('Cursinho Beta')).toBeInTheDocument();
    expect(screen.queryByText('Redações para revisar')).not.toBeInTheDocument();
    expect(screen.queryByText('Estudantes atendidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Frequência no cursinho')).not.toBeInTheDocument();
  });

  it('busca o desempenho uma vez, mesmo com quatro widgets lendo', async () => {
    auth.data.profiles = ['common'];
    renderPoc();

    expect(await screen.findByText('Matemática')).toBeInTheDocument();
    expect(getPerformance).toHaveBeenCalledTimes(1);
  });

  it('erro numa fonte mostra "tentar novamente" e busca de novo', async () => {
    auth.data.profiles = ['common'];
    getPerformance.mockRejectedValueOnce(new Error('boom'));
    renderPoc();

    // O primeiro "tentar novamente" da página é o do KPI de simulados.
    const retries = await screen.findAllByText('Tentar novamente');
    retries[0].click();

    // Ao carregar, o card vira link: a busca tem de ser refeita a cada tentativa.
    await waitFor(() =>
      expect(within(kpi('Simulados feitos')).getByText('2')).toBeInTheDocument(),
    );
    expect(getPerformance).toHaveBeenCalledTimes(2);
  });
});
