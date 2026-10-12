import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const svc = vi.hoisted(() => ({
  meusEventos: vi.fn(),
  inscreverNoEvento: vi.fn(),
  desistirDoEvento: vi.fn(),
}));
vi.mock('@/services/eventoSimulado', () => svc);
vi.mock('@/store/auth', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ data: { token: 'tk' } }),
}));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

import { SimuladoDoCursinho } from './SimuladoDoCursinho';

const evento = (over = {}) => ({
  id: 'e1',
  nome: 'Simulado de outubro',
  descricao: 'Sábado, 8h, na escola',
  cursinho: 'Cursinho A',
  inscricoesAte: '2026-10-10T11:00:00.000Z',
  provas: [
    { provaId: 'p-en', nome: 'Simulado Inglês' },
    { provaId: 'p-es', nome: 'Simulado Espanhol' },
  ],
  minhaProvaId: null,
  ...over,
});

describe('Card do simulado do cursinho no dashboard (026 · 07)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem evento aberto: não aparece', async () => {
    svc.meusEventos.mockResolvedValue([]);
    const { container } = render(<SimuladoDoCursinho />);
    await waitFor(() => expect(svc.meusEventos).toHaveBeenCalledWith('tk'));
    expect(container).toBeEmptyDOMElement();
  });

  it('erro ao buscar: também não aparece (não quebra o dashboard)', async () => {
    svc.meusEventos.mockRejectedValue(new Error('500'));
    const { container } = render(<SimuladoDoCursinho />);
    await waitFor(() => expect(svc.meusEventos).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('escolhe a prova e se inscreve', async () => {
    svc.meusEventos.mockResolvedValue([evento()]);
    svc.inscreverNoEvento.mockResolvedValue({
      evento: evento({ minhaProvaId: 'p-es' }),
      resultado: 'nova',
    });
    render(<SimuladoDoCursinho />);
    expect(await screen.findByText('Simulado de outubro')).toBeInTheDocument();
    expect(screen.getByText('Sábado, 8h, na escola')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Quero fazer' }));
    expect(toast.error).toHaveBeenCalledWith('Escolha o simulado que você vai fazer.');
    expect(svc.inscreverNoEvento).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Simulado Espanhol'));
    fireEvent.click(screen.getByRole('button', { name: 'Quero fazer' }));
    await waitFor(() =>
      expect(svc.inscreverNoEvento).toHaveBeenCalledWith('tk', 'e1', 'p-es', undefined),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Você está inscrito em Simulado Espanhol',
    );
    expect(toast.success).toHaveBeenCalledWith('Inscrição confirmada!');
  });

  it('uma prova só: um clique, sem escolha', async () => {
    svc.meusEventos.mockResolvedValue([
      evento({ provas: [{ provaId: 'p-unica', nome: 'Simulado Geral' }] }),
    ]);
    svc.inscreverNoEvento.mockResolvedValue({
      evento: evento({
        provas: [{ provaId: 'p-unica', nome: 'Simulado Geral' }],
        minhaProvaId: 'p-unica',
      }),
      resultado: 'nova',
    });
    render(<SimuladoDoCursinho />);
    fireEvent.click(await screen.findByRole('button', { name: 'Quero fazer' }));
    expect(screen.queryByRole('radio')).toBeNull();
    await waitFor(() =>
      expect(svc.inscreverNoEvento).toHaveBeenCalledWith('tk', 'e1', 'p-unica', undefined),
    );
  });

  it('inscrito: troca de prova e desiste', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    svc.meusEventos.mockResolvedValue([evento({ minhaProvaId: 'p-en' })]);
    svc.inscreverNoEvento.mockResolvedValue({
      evento: evento({ minhaProvaId: 'p-es' }),
      resultado: 'troca',
    });
    svc.desistirDoEvento.mockResolvedValue(undefined);
    render(<SimuladoDoCursinho />);

    expect(await screen.findByRole('status')).toHaveTextContent('Simulado Inglês');
    expect(screen.queryByRole('button', { name: /Trocar para/ })).toBeNull();
    fireEvent.click(screen.getByLabelText('Simulado Espanhol'));
    fireEvent.click(screen.getByRole('button', { name: 'Trocar para Simulado Espanhol' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Simulado Espanhol'));

    fireEvent.click(screen.getByRole('button', { name: 'Desistir' }));
    await waitFor(() => expect(svc.desistirDoEvento).toHaveBeenCalledWith('tk', 'e1'));
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.getByRole('button', { name: 'Quero fazer' })).toBeInTheDocument();
  });

  describe('tickets/039: o aluno escolhe o simulado', () => {
    const dia1 = (over = {}) =>
      evento({
        provas: [{ provaId: 'p-dia1', nome: 'Enem Dia 1' }],
        opcoes: [
          { provaId: 'p-dia1', simuladoId: 's-ing', nome: 'Enem Dia 1 Inglês' },
          { provaId: 'p-dia1', simuladoId: 's-esp', nome: 'Enem Dia 1 Espanhol' },
        ],
        meuSimuladoId: null,
        ...over,
      });

    it('Enem Dia 1: as duas línguas como opções; inscreve no simulado escolhido', async () => {
      svc.meusEventos.mockResolvedValue([dia1()]);
      svc.inscreverNoEvento.mockResolvedValue({
        evento: dia1({ minhaProvaId: 'p-dia1', meuSimuladoId: 's-esp' }),
        resultado: 'nova',
      });
      render(<SimuladoDoCursinho />);
      expect(
        await screen.findByText('Qual simulado você vai fazer?'),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Enem Dia 1 Espanhol'));
      fireEvent.click(screen.getByRole('button', { name: 'Quero fazer' }));
      await waitFor(() =>
        expect(svc.inscreverNoEvento).toHaveBeenCalledWith('tk', 'e1', 'p-dia1', 's-esp'),
      );
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Você está inscrito em Enem Dia 1 Espanhol',
      );
    });

    it('inscrito em Inglês: troca para Espanhol', async () => {
      svc.meusEventos.mockResolvedValue([
        dia1({ minhaProvaId: 'p-dia1', meuSimuladoId: 's-ing' }),
      ]);
      svc.inscreverNoEvento.mockResolvedValue({
        evento: dia1({ minhaProvaId: 'p-dia1', meuSimuladoId: 's-esp' }),
        resultado: 'troca',
      });
      render(<SimuladoDoCursinho />);
      expect(await screen.findByRole('status')).toHaveTextContent('Enem Dia 1 Inglês');
      expect(screen.getByText('Trocar de simulado')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Enem Dia 1 Espanhol'));
      fireEvent.click(
        screen.getByRole('button', { name: 'Trocar para Enem Dia 1 Espanhol' }),
      );
      await waitFor(() =>
        expect(svc.inscreverNoEvento).toHaveBeenCalledWith('tk', 'e1', 'p-dia1', 's-esp'),
      );
      expect(toast.success).toHaveBeenCalledWith('Agora você vai fazer Enem Dia 1 Espanhol.');
    });
  });
});
