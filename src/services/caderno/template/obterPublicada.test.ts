import { beforeEach, describe, expect, it, vi } from "vitest";
import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { obterPublicada } from "./obterPublicada";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const versao = {
  versao: 2,
  status: "publicada",
  criadorId: "u1",
  publicadaEm: "2026-09-12T00:00:00.000Z",
  notas: "capa nova",
  origemVersao: 1,
};

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => versao,
  } as unknown as Response);
});

describe("obterPublicada", () => {
  it("devolve a versão em vigor no caminho feliz", async () => {
    const recebido = await obterPublicada("tok");

    expect(recebido).toEqual(versao);
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(cadernoTemplate);
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });

  it("503 'nenhuma versão publicada' vira null, não erro", async () => {
    // ⚠️ O ms lança `ServiceUnavailableException` quando não há versão
    // publicada — 503, mas NÃO é indisponibilidade de serviço: é o estado
    // legítimo de quem ainda não publicou nada, e é o estado de homologação
    // hoje (coleção e índices criados, seed não rodado). Se este service
    // lançar, a primeira pessoa que abrir a tela em homol pega um 503 solto e
    // o modal quebra, em vez de ler "nenhuma versão publicada ainda".
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        message:
          "Nenhuma versão do template do caderno está publicada. Publique uma versão antes de gerar cadernos.",
      }),
    } as unknown as Response);

    await expect(obterPublicada("tok")).resolves.toBeNull();
  });

  it("404 NÃO é engolido — é outra coisa, e esconder seria defeito", async () => {
    // Esta rota não devolve 404 hoje. Se um dia devolver, é rota errada ou
    // proxy — tratar junto com o 503 mostraria "nenhuma versão publicada"
    // para um defeito de verdade.
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        message: "Cannot GET /mssimulado/caderno/template",
      }),
    } as unknown as Response);

    await expect(obterPublicada("tok")).rejects.toThrow(/Cannot GET/);
  });

  it("erro de verdade propaga a mensagem do backend", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "falha ao ler o template" }),
    } as unknown as Response);

    await expect(obterPublicada("tok")).rejects.toThrow(/falha ao ler/);
  });
});
