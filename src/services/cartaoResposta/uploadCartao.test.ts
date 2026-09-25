import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadCartao } from "./uploadCartao";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

beforeEach(() => mockedFetch.mockReset());

const resposta = (status: number, corpo?: unknown) =>
  ({
    status,
    json: async () => {
      if (corpo === undefined) throw new Error("sem corpo");
      return corpo;
    },
  }) as unknown as Response;

const arquivo = new File(["x"], "c.jpg", { type: "image/jpeg" });

describe("uploadCartao — 409", () => {
  it("⚠️ mostra a mensagem do backend — a do cartão falho manda usar o Reenviar", async () => {
    const texto =
      'Este cartão já foi enviado para este estudante e a leitura falhou. Use "Reenviar" no relatório do simulado.';
    mockedFetch.mockResolvedValue(resposta(409, { message: texto }));

    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(texto);
  });

  it("sem corpo, a frase de sempre", async () => {
    mockedFetch.mockResolvedValue(resposta(409));

    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(
      "Cartão já enviado para este aluno",
    );
  });
});
