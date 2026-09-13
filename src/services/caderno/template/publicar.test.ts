import { beforeEach, describe, expect, it, vi } from "vitest";
import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { ErroDeLint } from "./erros";
import { publicar } from "./publicar";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const versao = {
  versao: 4,
  status: "publicada",
  criadorId: "u1",
  publicadaEm: "2026-09-12T00:00:00.000Z",
  notas: "capa nova",
  origemVersao: 3,
};

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => versao,
  } as unknown as Response);
});

describe("publicar", () => {
  it("devolve a versão nova no caminho feliz", async () => {
    const recebido = await publicar("tok");

    expect(recebido).toEqual(versao);
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cadernoTemplate}/rascunho/publicar`);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("409 traz a LISTA de erros de lint na mensagem, não 'Conflito'", async () => {
    // ⚠️ É o que a tela mostra. Se o service colapsar a lista num texto
    // genérico, o coordenador não sabe o que consertar — e a api foi
    // construída para preservar essa lista exatamente por isso.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: "o rascunho não passou no lint",
        erros: ["main.tex — falta \\input{conteudo}"],
      }),
    } as unknown as Response);

    await expect(publicar("tok")).rejects.toMatchObject({
      erros: ["main.tex — falta \\input{conteudo}"],
    });
  });

  it("o 409 chega como ErroDeLint, com a lista iterável e a mensagem do ms", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: "o rascunho não passou no lint",
        erros: [
          "main.tex — falta \\input{conteudo}",
          "capa.tex — \\usepackage duplicado",
        ],
      }),
    } as unknown as Response);

    const erro = await publicar("tok").catch((e) => e);

    expect(erro).toBeInstanceOf(ErroDeLint);
    expect(erro.message).toBe("o rascunho não passou no lint");
    // A tela itera item por item: a lista precisa chegar como array, não
    // achatada dentro da string da mensagem.
    expect(Array.isArray(erro.erros)).toBe(true);
    expect(erro.erros).toHaveLength(2);
    expect(erro.message).not.toContain("usepackage");
  });

  it("404 sem rascunho vira Error comum, não ErroDeLint", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "não há rascunho para publicar" }),
    } as unknown as Response);

    const erro = await publicar("tok").catch((e) => e);

    expect(erro).toBeInstanceOf(Error);
    expect(erro).not.toBeInstanceOf(ErroDeLint);
    expect(erro.message).toMatch(/não há rascunho/);
  });
});
