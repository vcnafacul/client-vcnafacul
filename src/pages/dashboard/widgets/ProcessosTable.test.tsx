import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { StatusApplication } from '@/enums/prepCourse/statusApplication';
import type { OpenInscription } from '@/services/dashboard';

const rows = vi.hoisted(() => ({ data: [] as OpenInscription[] }));
vi.mock('../data', () => ({
  useDashData: () => ({
    data: rows.data,
    isLoading: false,
    error: null,
    retry: vi.fn(),
  }),
}));

import { ProcessosTable } from './ProcessosTable';
import { statusLabel } from './statusLabel';

const processo = (
  id: string,
  studentStatus: StatusApplication | null,
): OpenInscription => ({
  id,
  name: `Processo ${id}`,
  endDate: '2099-01-01T00:00:00.000Z',
  cursinho: { name: `Cursinho ${id}`, logo: null },
  studentStatus,
});

describe('ProcessosTable', () => {
  it('sem inscrição mostra "-" e leva ao formulário; inscrito leva às inscrições', () => {
    rows.data = [
      processo('a', null),
      processo('b', StatusApplication.UnderReview),
    ];
    render(
      <MemoryRouter>
        <ProcessosTable />
      </MemoryRouter>,
    );

    const linhaA = screen.getByText('Cursinho a').closest('tr')!;
    expect(within(linhaA).getByText('-')).toBeInTheDocument();
    expect(within(linhaA).getByRole('link')).toHaveAttribute(
      'href',
      '/cursinho/inscricao/a',
    );

    const linhaB = screen.getByText('Cursinho b').closest('tr')!;
    expect(within(linhaB).getByText('Inscrito')).toBeInTheDocument();
    expect(within(linhaB).getByRole('link')).toHaveAttribute(
      'href',
      '/dashboard/acompanhamento-inscricoes',
    );
  });

  it.each([
    [null, '-'],
    [StatusApplication.UnderReview, 'Inscrito'],
    [StatusApplication.SendedDocument, 'Inscrito'],
    [StatusApplication.DeclaredInterest, 'Declarou Interesse'],
    [StatusApplication.CalledForEnrollment, 'Declarou Interesse'],
    [StatusApplication.Rejected, 'Indeferido'],
    [StatusApplication.EnrollmentClosed, 'Matrícula Encerrada'],
  ])('status %s vira "%s"', (status, label) => {
    expect(statusLabel(status)).toBe(label);
  });
});
