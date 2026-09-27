import { getFirebaseMessaging } from "@/services/firebase/client";
import { swReady } from "@/pwa/registerSW";
import {
  deleteToken,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import { registrarAparelho, removerAparelho } from "./api";
import {
  ambienteAtual,
  ehIOS,
  iosAntigo,
  plataforma,
  versaoDoIOS,
} from "./plataforma";

export type PushStatus =
  | "disabled-by-flag" // VITE_PUSH_ENABLED != "true" (homol e dev ficam aqui)
  | "unsupported" // navegador sem SW/Push/Notification, ou FCM não suporta
  | "ios-needs-install" // iOS ≥ 16.4 fora do app instalado
  | "ios-too-old" // iOS < 16.4
  | "default" // pode pedir permissão
  | "denied" // bloqueado; só pelas configurações do navegador
  | "granted-not-registered" // permitido, mas sem assinatura (desativou aqui)
  | "active";

export type MensagemEmPrimeiroPlano = {
  title?: string;
  body?: string;
  url?: string;
};

const habilitado = () => import.meta.env.VITE_PUSH_ENABLED === "true";

function temApisDoNavegador(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * ⚠️ **A assinatura do navegador é a fonte da verdade de "ativo".** A permissão
 * continua `granted` depois de "Desativar" (só o navegador revoga), então ela
 * sozinha não diz se o aparelho recebe. O `deleteToken` do `disablePush`
 * cancela a assinatura; o `getToken` cria uma.
 */
async function temAssinatura(): Promise<boolean> {
  const reg = await swReady();
  return !!(await reg.pushManager.getSubscription());
}

async function messagingOuNull(): Promise<Messaging | null> {
  if (!habilitado() || !temApisDoNavegador()) return null;
  return getFirebaseMessaging();
}

async function tokenDoFcm(messaging: Messaging): Promise<string> {
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: await swReady(),
  });
}

function dadosDoAparelho(token: string) {
  const ambiente = ambienteAtual();
  return {
    token,
    platform: plataforma(ambiente),
    standalone: ambiente.standalone,
    userAgent: ambiente.userAgent,
  };
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!habilitado()) return "disabled-by-flag";

  const ambiente = ambienteAtual();
  if (ehIOS(ambiente)) {
    if (iosAntigo(versaoDoIOS(ambiente.userAgent))) return "ios-too-old";
    // No Safari (aba), o iOS nem expõe a Push API: só no app instalado.
    if (!ambiente.standalone) return "ios-needs-install";
  }

  if (!temApisDoNavegador() || !(await getFirebaseMessaging())) {
    return "unsupported";
  }

  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";
  return (await temAssinatura()) ? "active" : "granted-not-registered";
}

/**
 * Pede a permissão e registra o aparelho.
 *
 * ⚠️ **Chamar DIRETO do clique**, e o `requestPermission` é a primeira coisa
 * aqui: iOS e Firefox ignoram o pedido fora do gesto do usuário, e um prompt
 * negado é quase irreversível.
 */
export async function enablePush(authToken: string): Promise<PushStatus> {
  const permissao = await Notification.requestPermission();
  if (permissao === "denied") return "denied";
  if (permissao !== "granted") return "default";

  const messaging = await messagingOuNull();
  if (!messaging) return "unsupported";

  const token = await tokenDoFcm(messaging);
  await registrarAparelho(dadosDoAparelho(token), authToken);
  return "active";
}

/**
 * Para de receber neste aparelho. ⚠️ Tolerante a erro: se a api falhar, a
 * assinatura é cancelada mesmo assim — o aparelho para de receber de qualquer
 * jeito, e o token órfão na base cai na limpeza (BE-05/BE-07).
 */
export async function disablePush(): Promise<void> {
  const messaging = await messagingOuNull();
  if (!messaging) return;
  // Sem assinatura, o `getToken` CRIARIA uma — o oposto do que se quer.
  if (Notification.permission !== "granted" || !(await temAssinatura())) return;

  const token = await tokenDoFcm(messaging);
  try {
    await removerAparelho(token);
  } catch {
    /* segue para o deleteToken */
  }
  await deleteToken(messaging);
}

let ultimoUsuarioSincronizado: string | null = null;

/**
 * Depois do login e na abertura do app: reenvia o token (o FCM rotaciona) e
 * renova o `last_seen_at`, que impede a limpeza de 60 dias (BE-07). Também
 * reatribui o aparelho quando outra conta entra no mesmo navegador.
 *
 * - No máximo uma vez por usuário por sessão da página.
 * - ⚠️ Só se já há assinatura: quem clicou "Desativar" continua desativado.
 */
export async function syncPushToken(
  authToken: string,
  userId: string,
): Promise<void> {
  if (ultimoUsuarioSincronizado === userId) return;
  const messaging = await messagingOuNull();
  if (!messaging) return;
  if (Notification.permission !== "granted" || !(await temAssinatura())) return;

  ultimoUsuarioSincronizado = userId;
  try {
    await registrarAparelho(
      dadosDoAparelho(await tokenDoFcm(messaging)),
      authToken,
    );
  } catch {
    ultimoUsuarioSincronizado = null; // tenta de novo na próxima montagem
  }
}

/** Só para os testes. */
export function __reiniciarSincronizacao() {
  ultimoUsuarioSincronizado = null;
}

/**
 * Mensagem com o app aberto e visível: o SW NÃO mostra nada nesse caso (o SDK
 * repassa para a página), então quem avisa é o `cb` — um toast.
 */
export async function listenForeground(
  cb: (mensagem: MensagemEmPrimeiroPlano) => void,
): Promise<() => void> {
  const messaging = await messagingOuNull();
  if (!messaging) return () => undefined;
  return onMessage(messaging, (payload) => cb(payload.data ?? {}));
}
