import { contagem } from "@/services/indicadores";
import { frequencia, porcentagem } from "./formato";
import type { TurmaNoRanking } from "./turmas";

export interface ColunaDaTurma {
  titulo: string;
  valor: (t: TurmaNoRanking) => React.ReactNode;
}

/**
 * As colunas da tabela. Os cards seguintes acrescentam as suas (Frequência no
 * `07`, Desempenho no `09`).
 */
export const colunasBase: ColunaDaTurma[] = [
  { titulo: "Alunos", valor: (t) => contagem(t.metricas, "alunos") ?? "—" },
  { titulo: "Ativos", valor: (t) => contagem(t.metricas, "ativos") ?? "—" },
  {
    titulo: "Cancelamentos",
    valor: (t) => contagem(t.metricas, "cancelados") ?? "—",
  },
  { titulo: "Evasão", valor: (t) => porcentagem(t.evasao) ?? "—" },
  {
    titulo: "Frequência",
    valor: (t) =>
      contagem(t.metricas, "aulasRegistradas") === 0
        ? "sem chamadas"
        : (porcentagem(frequencia(t.metricas)) ?? "—"),
  },
];
