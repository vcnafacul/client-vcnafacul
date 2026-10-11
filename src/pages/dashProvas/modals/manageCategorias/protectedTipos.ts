/**
 * Nomes das categorias seedadas (imutáveis do ponto de vista de UI).
 * Usado apenas para exibir o badge "🔒 Categoria seedada" e desabilitar o
 * botão de excluir no frontend. A regra de verdade (categoria em uso) é
 * validada pelo backend no momento do DELETE (409 com `simuladosUsando`).
 */
export const CATEGORIAS_PROTEGIDAS = [
  "Enem Dia 1",
  "Enem Dia 2",
  "Linguagens",
  "Ciências Humanas",
  "Ciências da Natureza",
  "Matemática",
];

export function isProtegida(nome: string): boolean {
  return CATEGORIAS_PROTEGIDAS.includes(nome);
}

/** tickets/038 — "Enem Dia 1/2" compartilhadas com todos os cursinhos. */
export const TEXTO_COMPARTILHADA =
  "Categoria da plataforma, vale para todos os cursinhos — não pode ser excluída";
