import { afterEach, describe, expect, it, vi } from "vitest";
import { conviteDeInstalacaoLigado } from "./conviteLigado";

describe("convite de instalação só em produção (029)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    ["production", true],
    ["homologation", false],
    ["development", false],
    ["qa", false],
  ])("modo %s → %s", (modo, esperado) => {
    vi.stubEnv("MODE", modo);
    expect(conviteDeInstalacaoLigado()).toBe(esperado);
  });
});
