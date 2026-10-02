import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => ({
  enablePush: vi.fn(),
  getPushStatus: vi.fn(async () => "default"),
  registrarSePermitido: vi.fn(async () => true),
  bloqueadoPeloSistema: (e: unknown) =>
    e instanceof DOMException && e.name === "NotAllowedError",
}));
vi.mock("@/services/push/push", () => push);
vi.mock("@/services/push/api", () => ({
  listarMeusAparelhos: vi.fn(async () => []),
  enviarTeste: vi.fn(),
}));

import { usePushNotifications } from "./usePushNotifications";

beforeEach(() => vi.clearAllMocks());

describe("usePushNotifications.ativar", () => {
  it("devolve o status novo (o banner usa para explicar o bloqueio)", async () => {
    push.enablePush.mockResolvedValueOnce("denied");
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.status).toBe("default"));

    let novo: string | undefined;
    await act(async () => {
      novo = await result.current.ativar();
    });

    expect(novo).toBe("denied");
    expect(result.current.status).toBe("denied");
  });

  it("⚠️ permitiu, mas o sistema bloqueou o app (Android) → vira denied", async () => {
    push.enablePush.mockRejectedValueOnce(
      new DOMException("bloqueado", "NotAllowedError"),
    );
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.status).toBe("default"));

    let novo: string | undefined;
    await act(async () => {
      novo = await result.current.ativar();
    });

    expect(novo).toBe("denied");
    expect(result.current.status).toBe("denied");
  });

  it("outros erros sobem para quem chamou mostrar", async () => {
    push.enablePush.mockRejectedValueOnce(new Error("api fora"));
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.status).toBe("default"));

    await expect(
      act(() => result.current.ativar()),
    ).rejects.toThrow("api fora");
    expect(result.current.ocupado).toBe(false);
  });
});
