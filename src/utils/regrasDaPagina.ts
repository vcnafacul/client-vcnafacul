/**
 * Regras do endereço da página do cursinho (tickets/025) — as mesmas da api
 * (`regras-da-pagina.ts`), que é quem decide. Aqui só para a tela ajudar.
 */
export const SLUG_MIN = 3;
export const LINKS_MAX = 20;

/** "Quem somos" sem texto de verdade: vazio, só espaços ou só marcação. */
export const quemSomosVazio = (t: string) =>
  !t.replace(/[\s#*_>`~\-[\]()|\\]/g, "");

export const SLUG_MAX = 60;
const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugValido(slug: string): boolean {
  return slug.length >= SLUG_MIN && slug.length <= SLUG_MAX && SLUG_VALIDO.test(slug);
}

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Enquanto digita: minúsculas, sem acento, o resto vira `-`, sem `-` repetido
 * nem no começo. ⚠️ Deixa o `-` do FIM — senão não dá para digitar
 * "meu-cursinho" (o `-` sumiria antes do "c").
 */
export function normalizarEnquantoDigita(valor: string): string {
  return semAcento(valor)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, SLUG_MAX);
}

/** Ao salvar: tira também o `-` do fim. */
export function normalizarSlug(valor: string): string {
  return normalizarEnquantoDigita(valor).replace(/-+$/, "");
}
