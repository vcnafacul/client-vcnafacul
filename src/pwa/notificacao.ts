/*
  Regras da notificação push, sem nada de DOM nem de WebWorker: o `sw.ts` usa,
  e os testes rodam no jsdom. ⚠️ Não importar nada do app aqui — o SW é
  compilado separado (`tsconfig.sw.json`) e não pode puxar o bundle.
*/

export const ICONE_PADRAO = "/pwa/icon-192.png";
export const BADGE = "/pwa/badge-72.png";
export const TITULO_PADRAO = "Você na Facul";

/**
 * Mensagem do SW para as janelas abertas: "chegou notificação, recarregue a
 * central" (central-notificacoes, card 04). Aqui porque o SW e o app importam.
 */
export const MSG_ATUALIZAR_CENTRAL = "central:atualizar";

/** O que o backend manda em `data` (BE-05): tudo string, por exigência do FCM. */
export type DadosDoPush = Partial<
  Record<"title" | "body" | "url" | "tag" | "icon" | "notificationId", string>
>;

export type NotificacaoMontada = {
  titulo: string;
  opcoes: {
    body?: string;
    icon: string;
    badge: string;
    tag?: string;
    data: { url: string; notificationId?: string };
  };
};

/**
 * Em homol, todo push chega com "[Homol] " no título — para ninguém confundir
 * com prod (pedido de 2026-10-02). O `ci-homol` builda com
 * `--mode homologation`, e o SW e a página passam por aqui. A central do app
 * não leva o prefixo: ela já está dentro do app de homol.
 */
export const PREFIXO_HOMOL = "[Homol] ";

export function tituloDoAmbiente(titulo: string, modo: string): string {
  return modo === "homologation" ? `${PREFIXO_HOMOL}${titulo}` : titulo;
}

export function montarNotificacao(
  dados: DadosDoPush = {},
  modo: string = import.meta.env.MODE,
): NotificacaoMontada {
  return {
    titulo: tituloDoAmbiente(dados.title || TITULO_PADRAO, modo),
    opcoes: {
      body: dados.body,
      icon: dados.icon || ICONE_PADRAO,
      badge: BADGE,
      // Mesma tag substitui a notificação anterior em vez de empilhar.
      tag: dados.tag || undefined,
      data: { url: dados.url || "/", notificationId: dados.notificationId },
    },
  };
}

/**
 * Para onde o clique leva. ⚠️ Só abre URL da própria origem: o backend já
 * valida (BE-05), e isto é a segunda barreira contra usar a notificação para
 * phishing. Fora da origem → `null`, e o clique só fecha a notificação.
 */
export function destinoDoClique(
  url: string | undefined,
  origem: string,
): string | null {
  let alvo: URL;
  try {
    alvo = new URL(url || "/", origem);
  } catch {
    return null;
  }
  return alvo.origin === origem ? alvo.href : null;
}
