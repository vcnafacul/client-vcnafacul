import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusContent } from "../../enums/content/statusContent";
import { getTodoConteudo } from "./getContent";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("../../utils/fetchWrapper", () => ({ default: fetchWrapper }));

const pagina = (ids: string[], totalItems: number) => ({
  status: 200,
  json: async () => ({ data: ids.map((id) => ({ id })), totalItems }),
});

describe("getTodoConteudo", () => {
  beforeEach(() => fetchWrapper.mockReset());

  it("⚠️ junta todas as páginas — o V2 ordena em memória a lista inteira", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina(["a", "b"], 3))
      .mockResolvedValueOnce(pagina(["c"], 3));

    const r = await getTodoConteudo("tok", StatusContent.Pending_Upload, "m1", 2);

    expect(r.map((c) => c.id)).toEqual(["a", "b", "c"]);
    expect(fetchWrapper).toHaveBeenCalledTimes(2);
    expect(fetchWrapper.mock.calls[1][0]).toContain("materia=m1&page=2&limit=2");
  });

  it("página vazia para o laço, mesmo com totalItems inconsistente", async () => {
    fetchWrapper
      .mockResolvedValueOnce(pagina(["a"], 10))
      .mockResolvedValueOnce(pagina([], 10));

    const r = await getTodoConteudo("tok", StatusContent.Pending_Upload, "", 1);

    expect(r).toHaveLength(1);
    expect(fetchWrapper).toHaveBeenCalledTimes(2);
  });
});
