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

describe("uploadCartao — mensagens do servidor (card 35)", () => {
  it.each([
    [400, "Este cartão é de um simulado que não existe mais."],
    [400, "Este QR não é de um cartão-resposta do Você na Facul."],
    [403, "Este estudante não é do seu cursinho."],
    [403, "Este cartão é de um simulado de outro cursinho."],
    [502, 'O leitor de cartões está fora do ar. O cartão foi registrado: use "Reenviar" no relatório do simulado quando o serviço voltar.'],
  ])("%i mostra o texto do servidor: %s", async (status, texto) => {
    mockedFetch.mockResolvedValue(resposta(status, { message: texto }));

    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(texto);
  });

  it("⚠️ 400 sem corpo NÃO diz mais só 'ilegível' — manda tirar outra foto", async () => {
    mockedFetch.mockResolvedValue(resposta(400));

    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(/Tire outra foto/);
  });

  it("⚠️ 502 sem corpo avisa que o cartão ficou registrado", async () => {
    mockedFetch.mockResolvedValue(resposta(502));

    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(
      /O cartão foi registrado: use "Reenviar"/,
    );
  });

  it("403 sem corpo e status sem texto próprio têm frase genérica", async () => {
    mockedFetch.mockResolvedValue(resposta(403));
    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(
      "Você não pode enviar este cartão.",
    );

    mockedFetch.mockResolvedValue(resposta(500));
    await expect(uploadCartao(arquivo, "u1", "tok")).rejects.toThrow(
      "Erro ao enviar o cartão",
    );
  });
});
