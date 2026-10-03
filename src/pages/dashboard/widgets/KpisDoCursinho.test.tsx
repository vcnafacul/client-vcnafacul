import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const fontes = vi.hoisted(() => ({
  indicadores: { data: undefined as unknown, isLoading: false, error: null },
  studentsServed: { data: { total: 1234 }, isLoading: false, error: null },
}));
vi.mock('../data', () => ({
  useDashData: (key: keyof typeof fontes) => ({
    ...fontes[key],
    retry: () => {},
  }),
}));
vi.mock('@/components/indicadores/InfoDaMetrica', () => ({
  InfoDaMetrica: ({ metrica }: { metrica: string }) => (
    <button type="button">{`Como calculamos: ${metrica}`}</button>
  ),
}));

import { KpisDoCursinho } from './KpisDoCursinho';

const renderKpis = () =>
  render(<KpisDoCursinho />, { wrapper: MemoryRouter });

describe('KpisDoCursinho (tickets/033, card 10)', () => {
  it('colaborador de cursinho: ativos, evasão e frequência, levando aos Indicadores', () => {
    fontes.indicadores.data = {
      cursinho: true,
      periodos: [{ id: 'p1', nome: 'Período 2026' }],
      metricas: {
        alunos: 120,
        ativos: 98,
        cancelados: 22,
        desistenciaInicial: 6,
        presencas: 100,
        chamadasAluno: 120,
        aulasRegistradas: 64,
      },
    };
    renderKpis();

    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('de 120 alunos do período')).toBeInTheDocument();
    expect(screen.getByText('14%')).toBeInTheDocument();
    expect(screen.getByText('83,3%')).toBeInTheDocument();
    // o link do card e o (i) convivem: o (i) não fica dentro do <a>
    const link = screen.getByRole('link', { name: 'Evasão' });
    expect(link).toHaveAttribute('href', '/dashboard/indicadores');
    expect(link).toBeEmptyDOMElement();
    expect(
      screen.getByRole('button', { name: 'Como calculamos: Evasão' }),
    ).toBeInTheDocument();
    // ⚠️ o total da plataforma não aparece para o cursinho
    expect(screen.queryByText('Estudantes atendidos')).not.toBeInTheDocument();
  });

  it('cursinho sem período em andamento: nada', () => {
    fontes.indicadores.data = { cursinho: true, periodos: [], metricas: null };
    const { container } = renderKpis();
    expect(container).toBeEmptyDOMElement();
  });

  it('equipe do projeto (sem cursinho): continua o "Estudantes atendidos"', () => {
    fontes.indicadores.data = { cursinho: false, periodos: [], metricas: null };
    renderKpis();
    expect(screen.getByText('Estudantes atendidos')).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
  });
});
