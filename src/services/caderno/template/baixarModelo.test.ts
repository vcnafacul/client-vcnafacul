import { beforeEach, describe, expect, it, vi } from "vitest";
import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { baixarModelo } from "./baixarModelo";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const zip = new Blob(["PK"], { type: "application/zip" });

function okResponse() {
  return {
    ok: true,
    status: 200,
    blob: async () => zip,
  } as unknown as Response;
}

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue(okResponse());
});

function urlChamada() {
  return mockedFetch.mock.calls[0][0] as string;
}

describe("baixarModelo", () => {
  it("devolve o blob no caminho feliz", async () => {
    const recebido = await baixarModelo({}, "tok");

    expect(recebido).toBe(zip);
    expect(urlChamada()).toBe(`${cadernoTemplate}/teste`);
    const init = mockedFetch.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("monta ?versao=3", async () => {
    await baixarModelo({ versao: 3 }, "tok");
    expect(urlChamada()).toBe(`${cadernoTemplate}/teste?versao=3`);
  });

  it("monta ?rascunho=1", async () => {
    await baixarModelo({ rascunho: true }, "tok");
    expect(urlChamada()).toBe(`${cadernoTemplate}/teste?rascunho=1`);
  });

  it("decide pelo response.ok ANTES de ler o corpo", async () => {
    // ⚠️ Sucesso é binário, erro é JSON, e o corpo só pode ser lido UMA vez.
    // Ler o errado consome o stream e o download quebra. O baixarCaderno.ts
    // do card 06 já traz esse comentário.
    const blob = vi.fn();
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      blob,
      json: async () => ({ message: "nenhuma versão publicada" }),
    } as unknown as Response);

    await expect(baixarModelo({}, "tok")).rejects.toThrow(/nenhuma versão/);
    expect(blob).not.toHaveBeenCalled();
  });

  it("um 502 que devolve HTML não vira SyntaxError", async () => {
    // ⚠️ Proxy reverso responde HTML. Um `.json()` solto lançaria
    // SyntaxError e trocaria a mensagem útil por lixo.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    } as unknown as Response);

    await expect(baixarModelo({}, "tok")).rejects.toThrow(/indisponível|erro/i);
    await expect(baixarModelo({}, "tok")).rejects.not.toThrow(SyntaxError);
  });
});
