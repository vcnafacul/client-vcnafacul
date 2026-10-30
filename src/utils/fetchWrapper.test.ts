import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOGOFF_PATH } from "../routes/path";
import fetchWrapper from "./fetchWrapper";

const refreshToken = vi.hoisted(() => vi.fn());
vi.mock("../services/auth/refresh", () => ({ refreshToken }));

const logout = vi.hoisted(() => vi.fn());
vi.mock("../store/auth", () => ({
  useAuthStore: { getState: () => ({ logout, data: {} }) },
}));

/** Token que não expira (exp em 2100), para não cair na renovação prévia. */
const TOKEN = `x.${btoa(JSON.stringify({ exp: 4102444800 }))}.y`;

describe("fetchWrapper — 401", () => {
  const fetchMock = vi.fn();
  const location = { href: "/" };

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("location", location);
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 401 }));
    refreshToken.mockReset().mockRejectedValue(new Error("Falha ao renovar token"));
    logout.mockReset();
    location.href = "/";
  });

  afterEach(() => vi.unstubAllGlobals());

  it("⚠️ sem token só devolve o 401 — não renova nem manda para /logoff (laço home ↔ /logoff)", async () => {
    const res = await fetchWrapper("https://api/content/summary", { method: "GET" });

    expect(res.status).toBe(401);
    expect(refreshToken).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
    expect(location.href).toBe("/");
  });

  it("com token, renovação falhou → desloga e vai para /logoff", async () => {
    await expect(
      fetchWrapper("https://api/user/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }),
    ).rejects.toThrow("Falha ao renovar token");

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(location.href).toBe(LOGOFF_PATH);
  });
});
