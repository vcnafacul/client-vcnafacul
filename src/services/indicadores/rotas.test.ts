import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWrapper = vi.fn();
vi.mock("@/utils/fetchWrapper", () => ({ default: (...a: unknown[]) => fetchWrapper(...a) }));
vi.mock("@/services/urls", () => ({
  indicadores: "http://api/indicadores",
  indicadoresPeriodos: "http://api/indicadores/periodos",
  indicadoresSumindo: "http://api/indicadores/sumindo",
  indicadoresDesempenho: "http://api/indicadores/desempenho",
  indicadoresResumo: "http://api/indicadores/resumo",
}));

import { getDesempenho, getIndicadores, getPeriodosDosIndicadores, getSumindo, SemCursinho } from ".";

const ok = (corpo: unknown = {}) => ({ status: 200, json: () => Promise.resolve(corpo) });

describe("rotas dos indicadores (045)", () => {
  beforeEach(() => fetchWrapper.mockReset().mockResolvedValue(ok()));

  it("sem cursinho: as rotas de sempre", async () => {
    await getPeriodosDosIndicadores("tk");
    await getIndicadores("tk", "p1");
    expect(fetchWrapper.mock.calls.map((c) => c[0])).toEqual([
      "http://api/indicadores/periodos",
      "http://api/indicadores?periodoId=p1",
    ]);
  });

  it("com cursinho: as rotas do admin", async () => {
    await getPeriodosDosIndicadores("tk", "A");
    await getIndicadores("tk", "p1", "A");
    await getSumindo("tk", "p1", "A");
    await getDesempenho("tk", "p1", "A");
    expect(fetchWrapper.mock.calls.map((c) => c[0])).toEqual([
      "http://api/indicadores/cursinho/A/periodos",
      "http://api/indicadores/cursinho/A?periodoId=p1",
      "http://api/indicadores/cursinho/A/sumindo?periodoId=p1",
      "http://api/indicadores/cursinho/A/desempenho?periodoId=p1",
    ]);
  });

  it("404 nos períodos do próprio cursinho → SemCursinho; do admin, erro comum", async () => {
    fetchWrapper.mockResolvedValue({ status: 404, json: () => Promise.resolve({}) });
    await expect(getPeriodosDosIndicadores("tk")).rejects.toBeInstanceOf(SemCursinho);
    await expect(getPeriodosDosIndicadores("tk", "A")).rejects.not.toBeInstanceOf(SemCursinho);
  });
});
