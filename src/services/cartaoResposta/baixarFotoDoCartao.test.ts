import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { baixarFotoDoCartao } from "./baixarFotoDoCartao";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

beforeEach(() => mockedFetch.mockReset());

const resposta = (status: number) =>
  ({
    status,
    ok: status >= 200 && status < 300,
    blob: async () => new Blob(["x"]),
  }) as unknown as Response;

describe("baixarFotoDoCartao", () => {
  it("pede a imagem do histórico, com o id codificado", async () => {
    mockedFetch.mockResolvedValue(resposta(200));

    await baixarFotoDoCartao("tok", "h/1");

    expect(String(mockedFetch.mock.calls[0][0])).toMatch(
      /cartao-resposta\/h%2F1\/imagem$/,
    );
  });

  it("⚠️ 404 diz que não há foto, não 'erro'", async () => {
    mockedFetch.mockResolvedValue(resposta(404));

    await expect(baixarFotoDoCartao("tok", "h1")).rejects.toThrow(
      "Não há foto do cartão para este estudante.",
    );
  });

  it("outra recusa vira a mensagem genérica", async () => {
    mockedFetch.mockResolvedValue(resposta(500));

    await expect(baixarFotoDoCartao("tok", "h1")).rejects.toThrow(
      "Não foi possível baixar a foto do cartão.",
    );
  });
});
