import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  getCollaboratorDashboard,
  getEssayCountForReview,
  getEssayCountForReviewAll,
  getOpenInscriptions,
  getQuestoesPendentes,
  getStudentDashboard,
  getStudentsServed,
} from '@/services/dashboard';
import { getPerformance } from '@/services/historico/getPerformance';
import { getCurrentTheme, getMyStats } from '@/services/essay';

/**
 * Fontes de dado da dashboard. Vários widgets leem a mesma fonte (ex.: o KPI
 * de aproveitamento e o gráfico de evolução usam `performance`), então a
 * requisição é feita uma vez e compartilhada pelo cache abaixo.
 */
const sources = {
  performance: (token: string) => getPerformance(token),
  student: (token: string) => getStudentDashboard(token),
  collaborator: (token: string) => getCollaboratorDashboard(token),
  essays: async (token: string) => {
    const [stats, currentTheme] = await Promise.all([
      getMyStats(token),
      getCurrentTheme(token),
    ]);
    return { stats, currentTheme };
  },
  essaysToReview: (token: string) => getEssayCountForReview(token),
  essaysToReviewAll: (token: string) => getEssayCountForReviewAll(token),
  questoesPendentes: (token: string) => getQuestoesPendentes(token),
  studentsServed: (token: string) => getStudentsServed(token),
  openInscriptions: (token: string) => getOpenInscriptions(token),
};

type Sources = typeof sources;
export type SourceKey = keyof Sources;
type SourceData<K extends SourceKey> = Awaited<ReturnType<Sources[K]>>;

const cache = new Map<SourceKey, Promise<unknown>>();

/** Chamado ao montar a página: cada visita busca dado novo. */
export function clearDashCache() {
  cache.clear();
}

function load<K extends SourceKey>(key: K, token: string) {
  if (!cache.has(key)) {
    const promise = sources[key](token);
    // Falha não fica no cache, senão o "tentar novamente" repetiria o erro.
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return cache.get(key) as Promise<SourceData<K>>;
}

export function useDashData<K extends SourceKey>(key: K) {
  const token = useAuthStore((s) => s.data.token);
  const [state, setState] = useState<{
    data: SourceData<K> | null;
    isLoading: boolean;
    error: string | null;
  }>({ data: null, isLoading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    load(key, token)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [key, token, attempt]);

  const retry = useCallback(() => {
    cache.delete(key);
    setAttempt((a) => a + 1);
  }, [key]);

  return { ...state, retry };
}
