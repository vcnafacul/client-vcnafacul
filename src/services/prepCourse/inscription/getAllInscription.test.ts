import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllInscription, getTodasAsInscricoes } from "./getAllInscription";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));
// Sem VITE_BASE_URL no teste, a URL relativa não monta
vi.mock("@/services/urls", () => ({
  inscriptionCourse: "http://api/inscription-course",
}));

describe("getAllInscription (tickets/021 card 01)", () => {
  // reset, e não clear: sobras de mockResolvedValueOnce vazariam para o próximo teste
  afterEach(() => vi.resetAllMocks());

  it("⚠️ converte as datas da api (string ISO) em Date", async () => {
    fetchWrapper.mockResolvedValue({
      status: 200,
      json: async () => ({
        data: [
          {
            id: "p1",
            name: "Processo 2026",
            startDate: "2026-03-01T03:00:00.000Z",
            endDate: "2026-04-01T03:00:00.000Z",
            createdAt: "2026-02-10T15:30:00.000Z",
            updatedAt: "2026-02-11T15:30:00.000Z",
          },
        ],
        totalItems: 1,
      }),
    });

    const { data } = await getAllInscription("token");

    expect(data[0].startDate).toBeInstanceOf(Date);
    expect(data[0].endDate).toBeInstanceOf(Date);
    expect(data[0].createdAt).toBeInstanceOf(Date);
    expect(data[0].updatedAt).toBeInstanceOf(Date);
    expect(data[0].endDate.toISOString()).toBe("2026-04-01T03:00:00.000Z");
  });
});

describe("getTodasAsInscricoes (tickets/021 card 02)", () => {
  // reset, e não clear: sobras de mockResolvedValueOnce vazariam para o próximo teste
  afterEach(() => vi.resetAllMocks());

  const pagina = (ids: string[], totalItems: number) => ({
    status: 200,
    json: async () => ({
      data: ids.map((id) => ({
        id,
        startDate: "2026-03-01T03:00:00.000Z",
        endDate: "2026-04-01T03:00:00.000Z",
        createdAt: "2026-02-10T15:30:00.000Z",
        updatedAt: "2026-02-10T15:30:00.000Z",
      })),
      totalItems,
    }),
  });
  const ids = (de: number, ate: number) =>
    Array.from({ length: ate - de }, (_, i) => `p${de + i}`);

  it("⚠️ 250 processos: busca as 3 páginas e devolve os 250", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina(ids(0, 100), 250))
      .mockResolvedValueOnce(pagina(ids(100, 200), 250))
      .mockResolvedValueOnce(pagina(ids(200, 250), 250));

    const todas = await getTodasAsInscricoes("token");

    expect(todas).toHaveLength(250);
    expect(new Set(todas.map((t) => t.id)).size).toBe(250);
    const paginas = fetchWrapper.mock.calls.map(([url]) =>
      new URL(url).searchParams.get("page"),
    );
    expect(paginas).toEqual(["1", "2", "3"]);
  });

  it("cabe numa página: uma requisição só", async () => {
    fetchWrapper.mockResolvedValueOnce(pagina(ids(0, 7), 7));

    expect(await getTodasAsInscricoes("token")).toHaveLength(7);
    expect(fetchWrapper).toHaveBeenCalledTimes(1);
  });

  it("⚠️ erro na página 2: lança — nada de lista pela metade", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina(ids(0, 100), 150))
      .mockResolvedValueOnce({ status: 500, json: async () => ({}) });

    await expect(getTodasAsInscricoes("token")).rejects.toThrow();
  });

  it("totalItems maior que o real: para na página vazia, sem laço infinito", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina(ids(0, 100), 999))
      .mockResolvedValueOnce(pagina([], 999));

    expect(await getTodasAsInscricoes("token")).toHaveLength(100);
    expect(fetchWrapper).toHaveBeenCalledTimes(2);
  });
});
