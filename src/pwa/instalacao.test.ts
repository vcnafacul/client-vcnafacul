import { beforeEach, describe, expect, it, vi } from "vitest";

// Os testes simulam o build de produção (tickets/029: o convite só existe lá).
vi.mock("@/pwa/conviteLigado", () => ({ conviteDeInstalacaoLigado: () => true }));
import {
  __resetarInstalacao,
  estadoDaInstalacao,
  iniciarCapturaDaInstalacao,
  instalar,
  useInstalacaoDoApp,
} from "./instalacao";

const ambiente = (over = {}) => ({
  userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/130",
  maxTouchPoints: 5,
  standalone: false,
  ...over,
});

const convite = (outcome: "accepted" | "dismissed" = "accepted") => {
  const e = new Event("beforeinstallprompt") as Event & Record<string, unknown>;
  e.prompt = vi.fn().mockResolvedValue(undefined);
  e.userChoice = Promise.resolve({ outcome });
  return e;
};

describe("convite de instalação do app (029 · 01)", () => {
  beforeEach(() => __resetarInstalacao());

  it("⚠️ o evento capturado no boot fica guardado, e o Chrome não mostra a barra dele", () => {
    const alvo = new EventTarget() as unknown as Window;
    iniciarCapturaDaInstalacao(alvo);
    const e = convite();
    const prevent = vi.spyOn(e, "preventDefault");
    alvo.dispatchEvent(e);
    expect(prevent).toHaveBeenCalled();
    expect(useInstalacaoDoApp.getState().evento).toBe(e);
    expect(estadoDaInstalacao(useInstalacaoDoApp.getState(), ambiente())).toBe("instalavel");
  });

  it("instalar: chama o prompt nativo uma vez; aceitou → instalado", async () => {
    const e = convite("accepted");
    useInstalacaoDoApp.setState({ evento: e as never });
    expect(await instalar()).toBe("aceitou");
    expect(e.prompt).toHaveBeenCalledTimes(1);
    expect(await instalar()).toBe("indisponivel"); // o evento só serve uma vez
    expect(estadoDaInstalacao(useInstalacaoDoApp.getState(), ambiente())).toBe("instalado");
  });

  it("recusou → não marca instalado, e o evento é descartado", async () => {
    useInstalacaoDoApp.setState({ evento: convite("dismissed") as never });
    expect(await instalar()).toBe("recusou");
    expect(useInstalacaoDoApp.getState()).toMatchObject({ evento: null, instalado: false });
  });

  it("appinstalled → instalado", () => {
    const alvo = new EventTarget() as unknown as Window;
    iniciarCapturaDaInstalacao(alvo);
    alvo.dispatchEvent(convite());
    alvo.dispatchEvent(new Event("appinstalled"));
    expect(estadoDaInstalacao(useInstalacaoDoApp.getState(), ambiente())).toBe("instalado");
  });

  it.each([
    ["no app (standalone)", { evento: null, instalado: false }, { standalone: true }, "instalado"],
    [
      "iPhone no Safari",
      { evento: null, instalado: false },
      { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)" },
      "ios",
    ],
    ["Firefox Android (sem evento)", { evento: null, instalado: false }, {}, "indisponivel"],
  ])("%s → %s", (_n, estado, amb, esperado) => {
    expect(estadoDaInstalacao(estado as never, ambiente(amb))).toBe(esperado);
  });

  it("⚠️ fora de produção (homol, local): nunca convida — só 'instalado' continua valendo", () => {
    const comConvite = { evento: {} as never, instalado: false };
    expect(estadoDaInstalacao(comConvite, ambiente(), false)).toBe("indisponivel");
    expect(
      estadoDaInstalacao(
        { evento: null, instalado: false },
        ambiente({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)" }),
        false,
      ),
    ).toBe("indisponivel");
    expect(estadoDaInstalacao(comConvite, ambiente({ standalone: true }), false)).toBe("instalado");
  });
});
