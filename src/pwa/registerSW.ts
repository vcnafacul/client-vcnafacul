import { registerSW } from "virtual:pwa-register";

type Dependencias = {
  habilitado: boolean;
  serviceWorker: ServiceWorkerContainer | undefined;
  registrar: () => void;
};

/**
 * Registra o service worker do PWA quando a flag `VITE_PUSH_ENABLED` está
 * ligada.
 *
 * ⚠️ **Flag desligada DESREGISTRA.** Um SW registrado continua no navegador
 * mesmo depois que o código que o registrou sai do ar. Sem o `unregister`,
 * desligar a flag não serviria de rollback.
 */
export async function iniciarPwa({
  habilitado,
  serviceWorker,
  registrar,
}: Dependencias): Promise<void> {
  if (!serviceWorker) return;

  if (habilitado) {
    registrar();
    return;
  }

  const registros = await serviceWorker.getRegistrations();
  await Promise.all(registros.map((r) => r.unregister()));
}

/**
 * Pronto quando o SW estiver ativo. O FE-03 passa isso ao `getToken` do
 * Firebase. ⚠️ O `registerSW` do plugin não devolve a registration, por isso
 * o `navigator.serviceWorker.ready`.
 */
export function swReady(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.ready;
}

export function registrarPwa(): void {
  void iniciarPwa({
    habilitado: import.meta.env.VITE_PUSH_ENABLED === "true",
    serviceWorker:
      "serviceWorker" in navigator ? navigator.serviceWorker : undefined,
    registrar: () => {
      registerSW({ immediate: true });
    },
  }).catch((error) => {
    console.error("Falha ao iniciar o service worker:", error);
  });
}
