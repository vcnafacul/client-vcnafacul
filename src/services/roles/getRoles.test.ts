import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRoles } from "./getRoles";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

beforeEach(() => mockedFetch.mockReset());

describe("getRoles", () => {
  it("⚠️ não pede limit=0 — a api recusa (aceita de 1 a 1000)", async () => {
    mockedFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: [], page: 1, limit: 1000, totalItems: 0 }),
    } as unknown as Response);

    const res = await getRoles("tok");

    // Sem BASE_URL no teste a URL não é absoluta — lê só a query.
    const query = String(mockedFetch.mock.calls[0][0]).split("?")[1];
    const limit = Number(new URLSearchParams(query).get("limit"));
    expect(limit).toBeGreaterThanOrEqual(1);
    expect(limit).toBeLessThanOrEqual(1000);
    expect(res.limit).toBe(1000);
  });
});
