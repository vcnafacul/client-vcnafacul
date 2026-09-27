import { destinoDoClique } from "@/pwa/notificacao";

/** Caminho interno para o `navigate`, ou `null` se a url sair do site. */
export function caminhoInterno(url: string | undefined): string | null {
  const destino = destinoDoClique(url, window.location.origin);
  if (!destino) return null;
  const { pathname, search, hash } = new URL(destino);
  return `${pathname}${search}${hash}`;
}
