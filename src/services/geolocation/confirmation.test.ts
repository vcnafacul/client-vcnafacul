import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmGeo, getMyConfirmations, unconfirmGeo } from "./confirmation";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);
beforeEach(() => mockedFetch.mockReset());
const ok = (corpo: unknown = null) =>
  ({ ok: true, json: async () => corpo }) as unknown as Response;

describe("serviço de confirmação", () => {
  it("POST e DELETE em /geo/:id/confirmation, com o token", async () => {
    mockedFetch.mockResolvedValue(ok());
    await confirmGeo("jwt", "g1");
    await unconfirmGeo("jwt", "g1");
    const [[u1, o1], [u2, o2]] = mockedFetch.mock.calls;
    expect(String(u1).endsWith("/geo/g1/confirmation")).toBe(true);
    expect(o1?.method).toBe("POST");
    expect(String(u2).endsWith("/geo/g1/confirmation")).toBe(true);
    expect(o2?.method).toBe("DELETE");
    expect((o1?.headers as Record<string, string>).Authorization).toBe(
      "Bearer jwt",
    );
  });

  it("me devolve os ids; falha lança", async () => {
    mockedFetch.mockResolvedValueOnce(ok(["g1", "g2"]));
    expect(await getMyConfirmations("jwt")).toEqual(["g1", "g2"]);
    mockedFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(confirmGeo("jwt", "g1")).rejects.toThrow();
  });
});
