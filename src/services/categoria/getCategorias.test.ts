import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategorias } from "./getCategorias";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

beforeEach(() => mockedFetch.mockReset());

describe("getCategorias", () => {
  it("⚠️ não pede limit=0 — a api recusa (aceita de 1 a 1000)", async () => {
    mockedFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: [] }),
    } as unknown as Response);

    await getCategorias("tok");

    const url = new URL(String(mockedFetch.mock.calls[0][0]));
    const limit = Number(url.searchParams.get("limit"));
    expect(limit).toBeGreaterThanOrEqual(1);
    expect(limit).toBeLessThanOrEqual(500);
  });
});
