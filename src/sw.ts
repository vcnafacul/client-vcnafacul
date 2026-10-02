/// <reference lib="webworker" />
/*
  Service worker do PWA. ⚠️ **Não faz cache de nada** (ver o `VitePWA` no
  `vite.config.ts`): sem `fetch` handler, toda requisição segue para a rede.

  Push (FE-02): o backend manda mensagens **só com `data`** (BE-05), e quem
  desenha a notificação é este arquivo. Se viesse o bloco `notification`, o SDK
  mostraria uma e o `onBackgroundMessage` outra.

  Com o app visível, o SDK repassa a mensagem para a página (`onMessage`, no
  FE-03) e não chama o `onBackgroundMessage`.
*/
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import {
  MSG_ATUALIZAR_CENTRAL,
  destinoDoClique,
  montarNotificacao,
} from "./pwa/notificacao";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/** Avisa as janelas abertas (em segundo plano, inclusive) para recarregar a central. */
async function avisarJanelas(): Promise<void> {
  const janelas = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const j of janelas) j.postMessage({ tipo: MSG_ATUALIZAR_CENTRAL });
}

self.addEventListener("notificationclick", (event) => {
  const destino = destinoDoClique(
    event.notification.data?.url,
    self.location.origin,
  );
  event.notification.close();
  if (!destino) return;

  event.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const aberta = janelas.find(
        (j) => new URL(j.url).origin === self.location.origin,
      );
      if (aberta) {
        aberta.postMessage({ tipo: MSG_ATUALIZAR_CENTRAL });
        await aberta.focus();
        // `navigate` só funciona em janela controlada por este SW.
        const navegou = await aberta.navigate(destino).catch(() => null);
        if (navegou) return;
      }
      await self.clients.openWindow(destino);
    })(),
  );
});

/*
  ⚠️ Config incompleta NÃO pode derrubar o SW: o `initializeApp`/`getMessaging`
  lançam, e um SW que lança na avaliação não instala — o site deixaria de ser
  instalável (FE-01) por falta de uma env de push.
*/
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

if (Object.values(config).every(Boolean)) {
  try {
    const messaging = getMessaging(initializeApp(config));
    onBackgroundMessage(messaging, (payload) => {
      const { titulo, opcoes } = montarNotificacao(payload.data);
      return Promise.all([
        self.registration.showNotification(titulo, opcoes),
        // Avisar é extra: falhar aqui não pode impedir a notificação.
        avisarJanelas().catch(() => undefined),
      ]);
    });
  } catch (error) {
    console.error("[sw] push desativado:", error);
  }
} else {
  console.warn("[sw] config do Firebase incompleta; push desativado");
}
