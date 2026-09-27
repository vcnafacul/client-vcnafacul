import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => ({ disablePush: vi.fn() }));
vi.mock("./push", () => push);

import {
  LIMITE_MS,
  aoSair,
  desativarAoSair,
  temDesativacaoPendente,
} from "./aoSair";

beforeEach(() => {
  sessionStorage.clear();
  push.disablePush.mockReset();
});
afterEach(() => vi.useRealTimers());

describe("aoSair", () => {
  it("⚠️ grava a marca de forma SÍNCRONA (antes de a página navegar)", () => {
    push.disablePush.mockReturnValue(new Promise(() => undefined));

    aoSair();

    // Nenhum await entre a chamada e esta linha — é o cenário do fetchWrapper,
    // que faz window.location.href logo depois do logout().
    expect(temDesativacaoPendente()).toBe(true);
    expect(push.disablePush).toHaveBeenCalledTimes(1);
  });

  it("desativou → tira a marca", async () => {
    push.disablePush.mockResolvedValue(undefined);
    aoSair();
    await desativarAoSair();
    expect(temDesativacaoPendente()).toBe(false);
  });

  it("falhou → a marca fica para a próxima carga", async () => {
    push.disablePush.mockRejectedValue(new Error("offline"));
    aoSair();
    await desativarAoSair();
    expect(temDesativacaoPendente()).toBe(true);
  });

  it("⚠️ trava → desiste em 2s, sem prender ninguém, e a marca fica", async () => {
    vi.useFakeTimers();
    push.disablePush.mockReturnValue(new Promise(() => undefined));
    sessionStorage.setItem("push_desativar_ao_sair", "1");

    const tentativa = desativarAoSair();
    await vi.advanceTimersByTimeAsync(LIMITE_MS);
    await tentativa;

    expect(LIMITE_MS).toBe(2000);
    expect(temDesativacaoPendente()).toBe(true);
  });
});
