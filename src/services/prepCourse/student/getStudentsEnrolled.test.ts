import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWrapper = vi.fn();
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));
// A base vem de VITE_BASE_URL, ausente nos testes.
vi.mock("@/services/urls", () => ({ enrolled: "http://api/enrolled" }));

const { getStudentsEnrolled } = await import("./getStudentsEnrolled");

const resposta = {
  status: 200,
  json: async () => ({
    name: "C",
    partnerId: "p",
    students: { data: [], page: 1, limit: 15, totalItems: 0 },
  }),
};

describe("getStudentsEnrolled — busca", () => {
  beforeEach(() => fetchWrapper.mockReset().mockResolvedValue(resposta));

  const url = () => new URL(fetchWrapper.mock.calls[0][0]);

  it("manda o termo aparado em `search`", async () => {
    await getStudentsEnrolled(
      "t",
      1,
      15,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "  ana  ",
    );
    expect(url().searchParams.get("search")).toBe("ana");
  });

  it("sem termo (ou só espaços) não manda `search`", async () => {
    await getStudentsEnrolled(
      "t",
      1,
      15,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "   ",
    );
    expect(url().searchParams.has("search")).toBe(false);
  });
});
