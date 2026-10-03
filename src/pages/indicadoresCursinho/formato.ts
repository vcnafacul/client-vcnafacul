/** `parte ÷ todo` em %, com uma casa só quando faz diferença ("14%", "13,6%"). */
export function taxa(parte: number | null, todo: number | null): number | null {
  if (parte === null || todo === null || todo <= 0) return null;
  return Math.round((parte / todo) * 1000) / 10;
}

export function porcentagem(valor: number | null): string | null {
  return valor === null ? null : `${valor.toLocaleString("pt-BR")}%`;
}

type ComContagens = Record<string, unknown> | undefined;

const n = (m: ComContagens, chave: string) => {
  const v = m?.[chave];
  return typeof v === "number" ? v : null;
};

/**
 * Evasão = (cancelamentos − desistência inicial) ÷ (alunos − desistência
 * inicial). Quem nunca frequentou não "evadiu": sai das duas partes da conta
 * (tickets/033, R4). Calculada depois da soma das turmas — nunca média das
 * taxas.
 */
export function evasao(m: ComContagens): number | null {
  const alunos = n(m, "alunos");
  const cancelados = n(m, "cancelados");
  if (alunos === null || cancelados === null) return null;
  const desistencia = n(m, "desistenciaInicial") ?? 0;
  return taxa(cancelados - desistencia, alunos - desistencia);
}

/** Presenças ÷ chamadas, somando todos os alunos (07). Sem chamada → null. */
export function frequencia(m: ComContagens): number | null {
  return taxa(n(m, "presencas"), n(m, "chamadasAluno"));
}
