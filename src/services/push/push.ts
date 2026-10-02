import { getFirebaseMessaging } from "@/services/firebase/client";
import { montarNotificacao, type DadosDoPush } from "@/pwa/notificacao";
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
  | "denied" // bloqueado; só pelas configurações do aparelho/navegador
  | "active"; // permitido nas configurações

export type MensagemEmPrimeiroPlano = DadosDoPush;

const habilitado = () => import.meta.env.VITE_PUSH_ENABLED === "true";

function temApisDoNavegador(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Só o `disablePush` usa: sem assinatura, o `getToken` CRIARIA uma. */
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

  // ⚠️ **A permissão do aparelho é a fonte da verdade** (decisão de
  // 2026-10-01): ligar e desligar é nas configurações do celular/navegador —
  // o site não consegue revogar a permissão (`Permissions.revoke` saiu da
  // especificação) nem abrir a tela de configurações.
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";
  return "active";
}

/**
 * Com a permissão concedida, garante o token na api — cria a assinatura se
 * ela não existir (ex.: depois de um logout). Sem pedir nada à pessoa.
 * Devolve se registrou.
 */
export async function registrarSePermitido(
  authToken: string,
): Promise<boolean> {
  const messaging = await messagingOuNull();
  if (!messaging || Notification.permission !== "granted") return false;
  await registrarNaApi(messaging, authToken);
  return true;
}

let registroEmAndamento: Promise<void> | null = null;

/**
 * ⚠️ **Um registro por vez.** O card de Minha conta e o `PushSync` registram ao
 * mesmo tempo ao abrir o app; dois `getToken` simultâneos criaram DOIS tokens
 * para o mesmo aparelho em homol (2026-10-01), e um deles morre no 1º envio.
 * Quem chega com um registro em andamento espera o mesmo.
 */
function registrarNaApi(messaging: Messaging, authToken: string) {
  registroEmAndamento ??= (async () => {
    try {
      await registrarAparelho(
        dadosDoAparelho(await tokenDoFcm(messaging)),
        authToken,
      );
    } finally {
      registroEmAndamento = null;
    }
  })();
  return registroEmAndamento;
}

/**
 * O navegador recusou criar a assinatura com a permissão "concedida": o
 * sistema bloqueou as notificações por fora (Android, nas configurações do
 * app) e a página ainda não soube.
 */
export function bloqueadoPeloSistema(erro: unknown): boolean {
  return erro instanceof DOMException && erro.name === "NotAllowedError";
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

  await registrarNaApi(messaging, authToken);
  return "active";
}

/**
 * Para de receber neste aparelho — usado no logout (FE-05); na tela não há
 * mais "Desativar". ⚠️ Tolerante a erro: se a api falhar, a
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
let ultimaSincronizacao = 0;
/** Ao voltar para o app, no máximo uma sincronização a cada 30s. */
export const INTERVALO_MINIMO_MS = 30_000;

/**
 * Depois do login e na abertura do app: reenvia o token (o FCM rotaciona) e
 * renova o `last_seen_at`, que impede a limpeza de 60 dias (BE-07). Também
 * reatribui o aparelho quando outra conta entra no mesmo navegador.
 *
 * - No máximo uma vez por usuário por sessão da página — ou, com `aoVoltar`
 *   (o app voltou para a frente), a cada `INTERVALO_MINIMO_MS`: quem religou
 *   nas configurações ganhou uma assinatura nova, e o token novo tem de chegar
 *   na api antes do próximo envio.
 * - ⚠️ Basta a permissão do aparelho: quem permitiu nas configurações volta a
 *   receber ao logar, mesmo que o logout tenha cancelado a assinatura.
 */
export async function syncPushToken(
  authToken: string,
  userId: string,
  { aoVoltar = false }: { aoVoltar?: boolean } = {},
): Promise<void> {
  const mesmoUsuario = ultimoUsuarioSincronizado === userId;
  if (mesmoUsuario && !aoVoltar) return;
  if (mesmoUsuario && Date.now() - ultimaSincronizacao < INTERVALO_MINIMO_MS)
    return;
  if (!(await messagingOuNull())) return;
  if (Notification.permission !== "granted") return;

  ultimoUsuarioSincronizado = userId;
  ultimaSincronizacao = Date.now();
  try {
    await registrarSePermitido(authToken);
  } catch {
    ultimoUsuarioSincronizado = null; // tenta de novo na próxima montagem
  }
}

/** Só para os testes. */
export function __reiniciarSincronizacao() {
  ultimoUsuarioSincronizado = null;
  ultimaSincronizacao = 0;
  registroEmAndamento = null;
}

/**
 * Mensagem com o app aberto e visível: o SW NÃO mostra nada nesse caso (o SDK
 * repassa para a página) — quem avisa é o `cb` (`mostrarEmPrimeiroPlano`).
 */
export async function listenForeground(
  cb: (mensagem: MensagemEmPrimeiroPlano) => void,
): Promise<() => void> {
  const messaging = await messagingOuNull();
  if (!messaging) return () => undefined;
  return onMessage(messaging, (payload) => cb(payload.data ?? {}));
}

/**
 * Mostra na barra do aparelho a mensagem que chegou com o app aberto, com o
 * MESMO desenho do SW (`montarNotificacao`). O clique cai no `notificationclick`
 * do SW, como as outras.
 *
 * ⚠️ Pelo `registration` do SW, não `new Notification()`: no Android o
 * construtor não existe (lança `TypeError`).
 *
 * ⚠️ No iPhone, todo push precisa virar notificação visível — senão o iOS
 * pode cortar a inscrição. Antes, com o app aberto, nada aparecia.
 */
export async function mostrarEmPrimeiroPlano(
  dados: MensagemEmPrimeiroPlano,
): Promise<void> {
  const { titulo, opcoes } = montarNotificacao(dados);
  const reg = await swReady();
  await reg.showNotification(titulo, opcoes);
}
