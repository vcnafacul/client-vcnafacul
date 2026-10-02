import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fcm = vi.hoisted(() => ({
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  onMessage: vi.fn(),
}));
const api = vi.hoisted(() => ({
  registrarAparelho: vi.fn(),
  removerAparelho: vi.fn(),
}));
const infra = vi.hoisted(() => ({
  messaging: { nome: "messaging" } as unknown,
  assinatura: null as unknown,
}));

vi.mock("firebase/messaging", () => fcm);
vi.mock("./api", () => api);
vi.mock("@/services/firebase/client", () => ({
  getFirebaseMessaging: () => Promise.resolve(infra.messaging),
}));
const registro = {
  pushManager: { getSubscription: () => Promise.resolve(infra.assinatura) },
  showNotification: vi.fn(async () => undefined),
};
vi.mock("@/pwa/registerSW", () => ({
  swReady: () => Promise.resolve(registro),
}));

import {
  __reiniciarSincronizacao,
  disablePush,
  enablePush,
  getPushStatus,
  INTERVALO_MINIMO_MS,
  bloqueadoPeloSistema,
  mostrarEmPrimeiroPlano,
  registrarSePermitido,
  syncPushToken,
} from "./push";

const UA_ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36";
const UA_IPHONE = (v: string) =>
  `Mozilla/5.0 (iPhone; CPU iPhone OS ${v} like Mac OS X) AppleWebKit/605.1.15 Version/${v.replace("_", ".")} Mobile/15E148 Safari/604.1`;

function navegador({
  ua = UA_ANDROID,
  standalone = false,
  permissao = "default" as NotificationPermission,
  pedido = "granted" as NotificationPermission,
  semApis = false,
} = {}) {
  vi.stubGlobal("navigator", {
    userAgent: ua,
    maxTouchPoints: 0,
    ...(semApis ? {} : { serviceWorker: {} }),
  });
  vi.stubGlobal("matchMedia", () => ({ matches: standalone }));
  if (semApis) {
    vi.stubGlobal("PushManager", undefined);
    // @ts-expect-error — remove a API para simular navegador sem push
    delete window.PushManager;
  } else {
    vi.stubGlobal("PushManager", function PushManager() {});
  }
  const Notification = {
    permission: permissao,
    requestPermission: vi.fn(async () => pedido),
  };
  vi.stubGlobal("Notification", Notification);
  return Notification;
}

beforeEach(() => {
  vi.stubEnv("VITE_PUSH_ENABLED", "true");
  vi.stubEnv("VITE_FIREBASE_VAPID_KEY", "vapid-publica");
  infra.messaging = { nome: "messaging" };
  infra.assinatura = null;
  fcm.getToken.mockResolvedValue("fcm-token");
  fcm.deleteToken.mockResolvedValue(true);
  api.registrarAparelho.mockResolvedValue(undefined);
  api.removerAparelho.mockResolvedValue(undefined);
  __reiniciarSincronizacao();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("getPushStatus", () => {
  it("flag desligada → disabled-by-flag (homol e dev)", async () => {
    vi.stubEnv("VITE_PUSH_ENABLED", "false");
    navegador();
    expect(await getPushStatus()).toBe("disabled-by-flag");
  });

  it("iPhone com iOS 16.3 → ios-too-old", async () => {
    navegador({ ua: UA_IPHONE("16_3") });
    expect(await getPushStatus()).toBe("ios-too-old");
  });

  it("iPhone 17 no Safari (aba) → ios-needs-install", async () => {
    navegador({ ua: UA_IPHONE("17_5"), standalone: false });
    expect(await getPushStatus()).toBe("ios-needs-install");
  });

  it("iPhone 17 instalado, permitido e assinado → active", async () => {
    navegador({
      ua: UA_IPHONE("17_5"),
      standalone: true,
      permissao: "granted",
    });
    infra.assinatura = {};
    expect(await getPushStatus()).toBe("active");
  });

  it("Android sem decidir → default; bloqueado → denied", async () => {
    navegador({ permissao: "default" });
    expect(await getPushStatus()).toBe("default");
    navegador({ permissao: "denied" });
    expect(await getPushStatus()).toBe("denied");
  });

  it("FCM não suporta (isSupported = false) → unsupported", async () => {
    navegador();
    infra.messaging = null;
    expect(await getPushStatus()).toBe("unsupported");
  });

  it("navegador sem Push API → unsupported", async () => {
    navegador({ semApis: true });
    expect(await getPushStatus()).toBe("unsupported");
  });

  it("⚠️ permitido nas configurações → active, mesmo sem assinatura", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = null;
    expect(await getPushStatus()).toBe("active");
  });
});

describe("enablePush", () => {
  it("⚠️ negado → não chama getToken nem a api", async () => {
    navegador({ pedido: "denied" });
    expect(await enablePush("jwt")).toBe("denied");
    expect(fcm.getToken).not.toHaveBeenCalled();
    expect(api.registrarAparelho).not.toHaveBeenCalled();
  });

  it("⚠️ já bloqueado → nem chama requestPermission (o navegador não perguntaria)", async () => {
    const n = navegador({ permissao: "denied" });
    expect(await enablePush("jwt")).toBe("denied");
    expect(n.requestPermission).not.toHaveBeenCalled();
    expect(api.registrarAparelho).not.toHaveBeenCalled();
  });

  it("já permitido → não pergunta de novo e registra o aparelho", async () => {
    const n = navegador({ permissao: "granted" });
    expect(await enablePush("jwt")).toBe("active");
    expect(n.requestPermission).not.toHaveBeenCalled();
    expect(api.registrarAparelho).toHaveBeenCalledTimes(1);
  });

  it("fechou o prompt sem decidir → default, sem registrar", async () => {
    navegador({ pedido: "default" });
    expect(await enablePush("jwt")).toBe("default");
    expect(api.registrarAparelho).not.toHaveBeenCalled();
  });

  it("concedido → getToken COM a registration do nosso SW e POST do aparelho", async () => {
    navegador({ pedido: "granted" });

    expect(await enablePush("jwt")).toBe("active");

    expect(fcm.getToken).toHaveBeenCalledWith(infra.messaging, {
      vapidKey: "vapid-publica",
      serviceWorkerRegistration: registro,
    });
    expect(api.registrarAparelho).toHaveBeenCalledWith(
      {
        token: "fcm-token",
        platform: "android",
        standalone: false,
        userAgent: UA_ANDROID,
      },
      "jwt",
    );
  });
});

describe("registrarSePermitido", () => {
  it("sem permissão → não pede nada e não registra", async () => {
    const n = navegador({ permissao: "default" });
    expect(await registrarSePermitido("jwt")).toBe(false);
    expect(n.requestPermission).not.toHaveBeenCalled();
    expect(api.registrarAparelho).not.toHaveBeenCalled();
  });

  it("com permissão → registra sem pedir", async () => {
    const n = navegador({ permissao: "granted" });
    expect(await registrarSePermitido("jwt")).toBe(true);
    expect(n.requestPermission).not.toHaveBeenCalled();
    expect(api.registrarAparelho).toHaveBeenCalledTimes(1);
  });

  it("⚠️ duas chamadas ao mesmo tempo → UM getToken e UM registro (antes: 2 tokens)", async () => {
    navegador({ permissao: "granted" });
    let liberar: (t: string) => void = () => undefined;
    fcm.getToken.mockReturnValueOnce(
      new Promise<string>((r) => {
        liberar = r;
      }),
    );

    const a = registrarSePermitido("jwt");
    const b = registrarSePermitido("jwt");
    await Promise.resolve();
    liberar("fcm-token");
    await Promise.all([a, b]);

    expect(fcm.getToken).toHaveBeenCalledTimes(1);
    expect(api.registrarAparelho).toHaveBeenCalledTimes(1);
  });

  it("depois de terminar, um novo registro roda de novo", async () => {
    navegador({ permissao: "granted" });
    await registrarSePermitido("jwt");
    await registrarSePermitido("jwt");
    expect(api.registrarAparelho).toHaveBeenCalledTimes(2);
  });

  it("sistema bloqueou por fora (NotAllowedError) é reconhecido", () => {
    expect(bloqueadoPeloSistema(new DOMException("x", "NotAllowedError"))).toBe(
      true,
    );
    expect(bloqueadoPeloSistema(new Error("503"))).toBe(false);
  });

  it("api fora → o erro sobe (a tela avisa)", async () => {
    navegador({ permissao: "granted" });
    api.registrarAparelho.mockRejectedValue(new Error("503"));
    await expect(registrarSePermitido("jwt")).rejects.toThrow("503");
  });
});

describe("disablePush", () => {
  it("⚠️ chama deleteToken mesmo com a api falhando", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = {};
    api.removerAparelho.mockRejectedValue(new Error("offline"));

    await disablePush();

    expect(api.removerAparelho).toHaveBeenCalledWith("fcm-token");
    expect(fcm.deleteToken).toHaveBeenCalledWith(infra.messaging);
  });

  it("⚠️ sem assinatura não chama getToken (ele CRIARIA uma)", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = null;

    await disablePush();

    expect(fcm.getToken).not.toHaveBeenCalled();
    expect(fcm.deleteToken).not.toHaveBeenCalled();
  });
});

describe("syncPushToken", () => {
  it("permissão diferente de granted → não faz nada", async () => {
    navegador({ permissao: "default" });
    await syncPushToken("jwt", "u1");
    expect(fcm.getToken).not.toHaveBeenCalled();
    expect(api.registrarAparelho).not.toHaveBeenCalled();
  });

  it("⚠️ permitido mas sem assinatura (ex.: depois do logout) → registra de novo", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = null;
    await syncPushToken("jwt", "u1");
    expect(fcm.getToken).toHaveBeenCalled();
    expect(api.registrarAparelho).toHaveBeenCalledWith(
      expect.objectContaining({ token: "fcm-token" }),
      "jwt",
    );
  });

  it("uma vez por usuário; outra conta no mesmo navegador sincroniza de novo", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = {};

    await syncPushToken("jwt-a", "a");
    await syncPushToken("jwt-a", "a");
    await syncPushToken("jwt-b", "b");

    expect(api.registrarAparelho).toHaveBeenCalledTimes(2);
    expect(api.registrarAparelho).toHaveBeenLastCalledWith(
      expect.objectContaining({ token: "fcm-token" }),
      "jwt-b",
    );
  });

  it("⚠️ ao voltar para o app: sincroniza de novo, no máximo a cada 30s", async () => {
    navegador({ permissao: "granted" });
    const agora = vi.spyOn(Date, "now").mockReturnValue(1_000_000);

    await syncPushToken("jwt", "u1");
    await syncPushToken("jwt", "u1", { aoVoltar: true }); // logo depois: não
    agora.mockReturnValue(1_000_000 + INTERVALO_MINIMO_MS);
    await syncPushToken("jwt", "u1", { aoVoltar: true }); // 30s depois: sim
    await syncPushToken("jwt", "u1"); // sem aoVoltar: não

    expect(api.registrarAparelho).toHaveBeenCalledTimes(2);
    agora.mockRestore();
  });

  it("falha na api → tenta de novo na próxima vez", async () => {
    navegador({ permissao: "granted" });
    infra.assinatura = {};
    api.registrarAparelho.mockRejectedValueOnce(new Error("503"));

    await syncPushToken("jwt", "u1");
    await syncPushToken("jwt", "u1");

    expect(api.registrarAparelho).toHaveBeenCalledTimes(2);
  });
});

describe("mostrarEmPrimeiroPlano", () => {
  it("⚠️ app aberto: vai para a barra do aparelho com o mesmo desenho do SW", async () => {
    await mostrarEmPrimeiroPlano({
      title: "Teste",
      body: "Funcionou",
      url: "/simulados",
      tag: "t1",
      notificationId: "n1",
    });
    expect(registro.showNotification).toHaveBeenCalledWith("Teste", {
      body: "Funcionou",
      icon: "/pwa/icon-192.png",
      badge: "/pwa/badge-72.png",
      tag: "t1",
      data: { url: "/simulados", notificationId: "n1" },
    });
  });
});
