/*
  Regras da notificação push, sem nada de DOM nem de WebWorker: o `sw.ts` usa,
  e os testes rodam no jsdom. ⚠️ Não importar nada do app aqui — o SW é
  compilado separado (`tsconfig.sw.json`) e não pode puxar o bundle.
*/

export const ICONE_PADRAO = "/pwa/icon-192.png";
export const BADGE = "/pwa/badge-72.png";
export const TITULO_PADRAO = "Você na Facul";

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

export function montarNotificacao(dados: DadosDoPush = {}): NotificacaoMontada {
  return {
    titulo: dados.title || TITULO_PADRAO,
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
