import { describe, expect, it, vi } from "vitest";

vi.mock("virtual:pwa-register", () => ({ registerSW: vi.fn() }));

import { iniciarPwa } from "./registerSW";

function containerCom(registros: { unregister: () => Promise<boolean> }[]) {
  return {
    getRegistrations: vi.fn().mockResolvedValue(registros),
  } as unknown as ServiceWorkerContainer;
}

describe("iniciarPwa", () => {
  it("registra o SW quando a flag está ligada", async () => {
    const registrar = vi.fn();
    const container = containerCom([]);

    await iniciarPwa({ habilitado: true, serviceWorker: container, registrar });

    expect(registrar).toHaveBeenCalledTimes(1);
    expect(container.getRegistrations).not.toHaveBeenCalled();
  });

  it("⚠️ flag desligada desregistra o SW que ficou de antes (rollback)", async () => {
    const registrar = vi.fn();
    const antigo = { unregister: vi.fn().mockResolvedValue(true) };

    await iniciarPwa({
      habilitado: false,
      serviceWorker: containerCom([antigo]),
      registrar,
    });

    expect(registrar).not.toHaveBeenCalled();
    expect(antigo.unregister).toHaveBeenCalledTimes(1);
  });

  it("navegador sem service worker não faz nada", async () => {
    const registrar = vi.fn();

    await iniciarPwa({ habilitado: true, serviceWorker: undefined, registrar });

    expect(registrar).not.toHaveBeenCalled();
  });
});
