/**
 * A trilha de navegação pela linhagem (card 34A) — uma pilha de ids.
 *
 * ⚠️ **Módulo próprio**, pelo `react-refresh/only-export-components`. E o nome
 * não é `trilhaDaLinhagem.ts` porque colide com `TrilhaDaLinhagem.tsx` em
 * sistema de arquivos que não distingue maiúsculas (macOS).
 */

/**
 * Abre `id` na trilha.
 *
 * ⚠️ **Já está na pilha? Volta até ela, não empilha de novo.** Sem isso, ir e
 * voltar entre v1 e v2 faria a trilha crescer sem fim.
 */
export function abrirNaTrilha(trilha: string[], id: string): string[] {
  const i = trilha.indexOf(id);
  return i >= 0 ? trilha.slice(0, i + 1) : [...trilha, id];
}

/** Volta um passo; nunca esvazia — a primeira questão fica. */
export function voltarNaTrilha(trilha: string[]): string[] {
  return trilha.length > 1 ? trilha.slice(0, -1) : trilha;
}
