import { createContext, useContext } from "react";

/**
 * O cursinho que a tela de Indicadores está mostrando (tickets/045).
 * `undefined` = o do próprio usuário (rotas de sempre); um id = a visão do
 * admin, pelas rotas `/indicadores/cursinho/:id/...`.
 */
export const CursinhoDosIndicadores = createContext<string | undefined>(undefined);

export const useCursinhoDosIndicadores = () => useContext(CursinhoDosIndicadores);

/** tickets/046 — a tela está na visão de todos os períodos? (para os textos) */
export const TodosOsPeriodos = createContext(false);

/** "neste período" ou "nos períodos", conforme a visão. */
export const useNoRecorte = () =>
  useContext(TodosOsPeriodos) ? "nos períodos" : "neste período";
