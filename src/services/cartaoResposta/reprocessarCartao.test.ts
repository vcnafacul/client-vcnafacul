import fetchWrapper from "@/utils/fetchWrapper";
import { cartaoResposta } from "@/services/urls";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reprocessarCartao } from "./reprocessarCartao";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const arquivo = new File(["foto"], "cartao.jpg", { type: "image/jpeg" });

const resposta = (over: Partial<Response> & { json?: () => Promise<unknown> } = {}) =>
  ({
    ok: true,
    status: 202,
    json: async () => ({}),
    ...over,
  }) as unknown as Response;

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue(resposta());
});

describe("reprocessarCartao", () => {
  it("POST na rota do histórico, com o Bearer", async () => {
    await reprocessarCartao("tok", "h1", arquivo);

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cartaoResposta}/h1/reprocessar`);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("manda FormData e NÃO declara Content-Type", async () => {
    // ⚠️ O browser põe o boundary do multipart. Declarar o header o substitui
    // por um sem boundary, e o servidor recebe um corpo que não parseia.
    // Mesmo padrão do uploadCartao.ts.
    await reprocessarCartao("tok", "h1", arquivo);

    const [, init] = mockedFetch.mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toBe(arquivo);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain(
      "content-type",
    );
  });

  it("sem arquivo, o corpo vai sem o campo `file`", async () => {
    // é o caminho do `reprocessar`: a foto serve, quem falhou foi a infra
    await reprocessarCartao("tok", "h1");

    const corpo = mockedFetch.mock.calls[0][1]?.body as FormData;
    expect(corpo.has("file")).toBe(false);
  });

  it("⚠️ 409 de janela repassa a mensagem INTEIRA, com os segundos", async () => {
    // um 429 sem número manda a pessoa tentar de novo na hora, e de novo
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 409,
        json: async () => ({
          statusCode: 409,
          message: "aguarde 42s para tentar novamente neste cartão",
        }),
      }),
    );

    await expect(reprocessarCartao("tok", "h1")).rejects.toThrow(
      "aguarde 42s para tentar novamente neste cartão",
    );
  });

  it("⚠️ 400 repassa QUAL cartão divergiu", async () => {
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 400,
        json: async () => ({ message: "a foto enviada é de outro cartão" }),
      }),
    );

    await expect(reprocessarCartao("tok", "h1", arquivo)).rejects.toThrow(
      "a foto enviada é de outro cartão",
    );
  });

  it("⚠️ a mensagem do backend passa em QUALQUER recusa, não só em 400/409", async () => {
    // 413 (foto grande demais) e 502 (OMR fora) dizem o que houve; trocar por
    // um texto genérico apaga justamente a parte acionável.
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 413,
        json: async () => ({ message: "File too large" }),
      }),
    );

    await expect(reprocessarCartao("tok", "h1", arquivo)).rejects.toThrow(
      "File too large",
    );
  });

  it("recusa sem corpo JSON ainda vira erro legível", async () => {
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("not json");
        },
      }),
    );

    await expect(reprocessarCartao("tok", "h1")).rejects.toThrow(
      /não foi possível reprocessar/i,
    );
  });

  it("⚠️ 201 é sucesso — a api não carimba 202, só documenta", async () => {
    // O @HttpCode(202) está só no ms; a rota da api herda o 201 padrão do
    // @Post. Exigir 202 aqui faria toda troca de foto parecer erro.
    mockedFetch.mockResolvedValue(resposta({ ok: true, status: 201 }));

    await expect(reprocessarCartao("tok", "h1")).resolves.toBeUndefined();
  });
});
