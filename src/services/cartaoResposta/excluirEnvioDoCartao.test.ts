import fetchWrapper from "@/utils/fetchWrapper";
import { cartaoResposta } from "@/services/urls";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { excluirEnvioDoCartao } from "./excluirEnvioDoCartao";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const resposta = (over: Partial<Response> = {}) =>
  ({ ok: true, status: 204, json: async () => ({}), ...over }) as Response;

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue(resposta());
});

describe("excluirEnvioDoCartao (card 36)", () => {
  it("DELETE na rota do histórico, encodado, com o Bearer", async () => {
    await excluirEnvioDoCartao("tok", "h1?x=1");

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cartaoResposta}/h1%3Fx%3D1`);
    expect(init?.method).toBe("DELETE");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("⚠️ recusa repassa a mensagem do servidor (409: leitura em andamento)", async () => {
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 409,
        json: async () => ({ message: "Aguarde terminar para excluir." }),
      }),
    );

    await expect(excluirEnvioDoCartao("tok", "h1")).rejects.toThrow(
      "Aguarde terminar para excluir.",
    );
  });

  it("resposta sem corpo: texto genérico", async () => {
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("sem json");
        },
      }),
    );

    await expect(excluirEnvioDoCartao("tok", "h1")).rejects.toThrow(
      "Não foi possível excluir o envio",
    );
  });
});
