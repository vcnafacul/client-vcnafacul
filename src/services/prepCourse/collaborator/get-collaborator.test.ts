import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWrapper = vi.fn();
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));
// A base vem de VITE_BASE_URL, ausente nos testes.
vi.mock("@/services/urls", () => ({ collaborator: "http://api/collaborator" }));

const { getTodosOsColaboradores } = await import("./get-collaborator");

const pagina = (ids: number[], totalItems: number) => ({
  status: 200,
  json: async () => ({ data: ids.map((id) => ({ id })), totalItems }),
});

describe("getTodosOsColaboradores", () => {
  beforeEach(() => fetchWrapper.mockReset());

  it("busca página por página até completar o total", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina([1, 2], 5))
      .mockResolvedValueOnce(pagina([3, 4], 5))
      .mockResolvedValueOnce(pagina([5], 5));

    const todos = await getTodosOsColaboradores("t", 2);

    expect(todos.map((c) => c.id)).toEqual([1, 2, 3, 4, 5]);
    expect(fetchWrapper).toHaveBeenCalledTimes(3);
    expect(fetchWrapper.mock.calls[2][0]).toContain("page=3");
  });

  it("para numa página vazia mesmo se o total não bater", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina([1], 10))
      .mockResolvedValueOnce(pagina([], 10));

    expect(await getTodosOsColaboradores("t", 1)).toHaveLength(1);
    expect(fetchWrapper).toHaveBeenCalledTimes(2);
  });
});
