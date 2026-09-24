import fetchWrapper from "@/utils/fetchWrapper";
import { convitesColaborador } from "@/services/urls";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { aceitarConvite, buscarConvitePorToken } from "./conviteColaborador";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);
const resposta = (status: number, corpo: unknown = {}) =>
  ({ status, json: async () => corpo }) as unknown as Response;

beforeEach(() => mockedFetch.mockReset());

describe("conviteColaborador (convite 04)", () => {
  it("por-token é público — sem Authorization", async () => {
    mockedFetch.mockResolvedValue(resposta(200, { funcao: "Professor" }));

    await buscarConvitePorToken("a/b");

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${convitesColaborador}/por-token/a%2Fb`);
    expect(init?.headers).toBeUndefined();
  });

  it("⚠️ aceitar: o token do CONVITE vai no corpo; quem autentica é o login", async () => {
    // O token do convite não autentica nada (card 01).
    mockedFetch.mockResolvedValue(resposta(201));

    await aceitarConvite("do-convite", "do-login");

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${convitesColaborador}/aceitar`);
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer do-login",
    );
    expect(JSON.parse(init?.body as string)).toEqual({ token: "do-convite" });
  });

  it("a recusa traz a mensagem do servidor", async () => {
    mockedFetch.mockResolvedValue(
      resposta(403, { message: "Este convite foi enviado para ana@x.com." }),
    );

    await expect(aceitarConvite("t", "l")).rejects.toThrow(
      "Este convite foi enviado para ana@x.com.",
    );
  });
});
