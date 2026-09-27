/// <reference lib="webworker" />
/*
  Service worker do PWA. ⚠️ **Não faz cache de nada** (ver o `VitePWA` no
  `vite.config.ts`): existe para o site ser instalável e, no FE-02, receber
  push. Sem `fetch` handler, toda requisição segue direto para a rede.
*/
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

export {};
