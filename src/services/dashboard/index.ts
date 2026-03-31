import fetchWrapper from '@/utils/fetchWrapper';
import {
  historico_summary,
  historicoByPeriod,
  inscriptionCourseOpen,
  dashboardStudent,
  dashboardCollaborator,
  essayMyCursinhoCount,
} from '../urls';

// --- Types ---

export interface SimuladoSummary {
  historicTotal: number;
  historicCompleted: number;
}

export interface SimuladoByPeriod {
  period: string;
  total: number;
  completos: number;
  incompletos: number;
}

export interface OpenInscription {
  id: string;
  name: string;
  endDate: string;
  cursinho: {
    name: string;
    logo: string | null;
  };
}

export interface StudentDashboard {
  cursinho: {
    name: string;
    logo: string | null;
  };
  matricula: string | null;
  turma: string | null;
  periodo: string | null;
  frequencia: {
    presencas: number;
    faltas: number;
    percentual: number;
  };
}

export interface CollaboratorDashboard {
  cursinho: {
    name: string;
    logo: string | null;
  };
  frentes: Array<{ id: string; name: string }>;
}

export interface EssayCountResponse {
  count: number;
}

// --- Fetchers ---

export async function getSimuladoSummary(
  token: string,
): Promise<SimuladoSummary> {
  const response = await fetchWrapper(historico_summary, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200)
    throw new Error('Erro ao buscar resumo de simulados');
  return response.json();
}

export async function getSimuladoByPeriod(
  token: string,
): Promise<SimuladoByPeriod[]> {
  const response = await fetchWrapper(
    `${historicoByPeriod}?groupBy=month`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200)
    throw new Error('Erro ao buscar evolução de simulados');
  return response.json();
}

export async function getOpenInscriptions(
  token: string,
): Promise<OpenInscription[]> {
  const response = await fetchWrapper(inscriptionCourseOpen, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200)
    throw new Error('Erro ao buscar processos seletivos');
  return response.json();
}

export async function getStudentDashboard(
  token: string,
): Promise<StudentDashboard[]> {
  const response = await fetchWrapper(dashboardStudent, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200)
    throw new Error('Erro ao buscar dados do cursinho');
  return response.json();
}

export async function getCollaboratorDashboard(
  token: string,
): Promise<CollaboratorDashboard> {
  const response = await fetchWrapper(dashboardCollaborator, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200)
    throw new Error('Erro ao buscar dados do colaborador');
  return response.json();
}

export async function getEssayCountForReview(
  token: string,
): Promise<EssayCountResponse> {
  const response = await fetchWrapper(
    `${essayMyCursinhoCount}?status=SUBMITTED`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status !== 200)
    throw new Error('Erro ao buscar contagem de redações');
  return response.json();
}
