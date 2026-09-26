import { afterEach, describe, expect, it, vi } from "vitest";
import { getAllInscription } from "./getAllInscription";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: fetchWrapper }));
// Sem VITE_BASE_URL no teste, a URL relativa não monta
vi.mock("@/services/urls", () => ({
  inscriptionCourse: "http://api/inscription-course",
}));

describe("getAllInscription (tickets/021 card 01)", () => {
  afterEach(() => vi.clearAllMocks());

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
