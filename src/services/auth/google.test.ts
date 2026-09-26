import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ErroDoCadastroGoogle,
  buscarCadastroGoogle,
  concluirCadastroGoogle,
  urlEntrarComGoogle,
} from "./google";

const resposta = (status: number, corpo: unknown) =>
  ({ ok: status < 400, status, json: async () => corpo }) as Response;

describe("services/auth/google", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("urlEntrarComGoogle leva o voltar codificado", () => {
    expect(urlEntrarComGoogle("/convite-colaborador?token=a&b")).toMatch(
      /\/user\/auth\/google\?voltar=%2Fconvite-colaborador%3Ftoken%3Da%26b$/,
    );
    expect(urlEntrarComGoogle()).toMatch(/\/user\/auth\/google$/);
  });

  it("leva o token do convite (card 05)", () => {
    const url = new URL(urlEntrarComGoogle("/x", "tok_123"), "http://api");
    expect(url.searchParams.get("convite")).toBe("tok_123");
    expect(url.searchParams.get("voltar")).toBe("/x");
  });

  it("⚠️ manda o cookie do cadastro (credentials include)", async () => {
    const fetch = vi.fn().mockResolvedValue(resposta(200, { email: "a@x.com" }));
    vi.stubGlobal("fetch", fetch);

    await buscarCadastroGoogle();

    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("⚠️ 401 vira erro com status — a tela mostra 'venceu' em vez de ir ao logoff", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(resposta(401, { message: "acabou" })),
    );

    const erro = await concluirCadastroGoogle({} as never).catch((e) => e);

    expect(erro).toBeInstanceOf(ErroDoCadastroGoogle);
    expect(erro.status).toBe(401);
    expect(erro.message).toBe("acabou");
  });
});
