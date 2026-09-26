import { useCallback, useState } from 'react';
import { View } from './registry';

const STORAGE_KEY = 'dashboard:view';

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Visão ativa da dashboard. A escolha fica no navegador (é conveniência de
 * quem vê, não dado da conta) e só vale se ainda for uma visão disponível —
 * se o usuário perdeu a matrícula, cai na primeira da lista.
 */
export function useDashView(views: View[]) {
  const [chosen, setChosen] = useState(readStored);
  const view = views.find((v) => v === chosen) ?? views[0];

  const change = useCallback((next: View) => {
    setChosen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem storage (aba anônima, bloqueio): a troca vale só nesta visita.
    }
  }, []);

  return [view, change] as const;
}
