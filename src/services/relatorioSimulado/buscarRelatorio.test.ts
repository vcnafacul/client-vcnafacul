import { describe, expect, it, vi, beforeEach } from "vitest";
import { buscarRelatorio } from "./buscarRelatorio";
import { buscarQuestoes } from "./buscarQuestoes";
import { buscarSimuladosComCartao } from "./buscarSimuladosComCartao";
import { buscarDetalheDoEstudante } from "./buscarDetalheDoEstudante";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));

const ok = (body: unknown) => ({ status: 200, json: async () => body });

describe("serviços do relatório de simulado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchWrapper.mockResolvedValue(ok({}));
  });

  it("buscarRelatorio sem turma NÃO manda turma na URL", async () => {
    await buscarRelatorio("tok", "sim-1");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toContain("/mssimulado/relatorio/simulado/sim-1");
    expect(url).not.toContain("turma");
  });

  it("buscarRelatorio com turma usa o segmento de turma", async () => {
    await buscarRelatorio("tok", "sim-1", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/sim-1/turma/t-1",
    );
  });

  it("manda o Bearer", async () => {
    await buscarRelatorio("tok-abc", "sim-1");

    const opcoes = fetchWrapper.mock.calls[0][1] as { headers: Record<string, string> };
    expect(opcoes.headers.Authorization).toBe("Bearer tok-abc");
  });

  it("status diferente de 200 vira erro em português", async () => {
    fetchWrapper.mockResolvedValue({ status: 500, json: async () => ({}) });

    await expect(buscarRelatorio("tok", "sim-1")).rejects.toThrow(
      /relatório/i,
    );
  });

  it("buscarQuestoes com turma usa o sufixo /questoes depois da turma", async () => {
    await buscarQuestoes("tok", "sim-1", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/sim-1/turma/t-1/questoes",
    );
  });

  it("buscarSimuladosComCartao não leva simuladoId nenhum", async () => {
    await buscarSimuladosComCartao("tok");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toMatch(/\/mssimulado\/relatorio\/simulado\/simulados$/);
  });

  it("buscarSimuladosComCartao com turma usa o segmento de turma", async () => {
    await buscarSimuladosComCartao("tok", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/simulados/turma/t-1",
    );
  });

  it("⚠️ turma vazia é tratada como SEM turma", async () => {
    // mesma armadilha do `?turma=` na rota do relatório: string vazia não pode
    // virar `/simulados/turma/`, que é uma rota que não existe
    await buscarSimuladosComCartao("tok", "");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toMatch(/\/simulados$/);
  });

  it("buscarDetalheDoEstudante monta a URL com simulado e usuário", async () => {
    await buscarDetalheDoEstudante("tok", "sim-1", "u1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/sim-1/estudante/u1",
    );
  });

  it("404 vira erro em português, não tela quebrada", async () => {
    fetchWrapper.mockResolvedValue({ status: 404, json: async () => ({}) });

    await expect(buscarDetalheDoEstudante("tok", "sim-1", "u1")).rejects.toThrow(
      /estudante|detalhe/i,
    );
  });
});
