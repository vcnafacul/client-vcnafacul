import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GoogleRetorno from ".";

const refreshToken = vi.hoisted(() => vi.fn());
vi.mock("@/services/auth/refresh", () => ({ refreshToken }));
vi.mock("@/utils/decodedUser", () => ({
  decoderUser: (t: string) => ({ token: t }),
}));
const doAuth = vi.hoisted(() => vi.fn());
vi.mock("@/store/auth", () => ({ useAuthStore: () => ({ doAuth }) }));

function Onde() {
  const { pathname, search } = useLocation();
  return <div data-testid="onde">{pathname + search}</div>;
}

const montar = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/auth/google${search}`]}>
      <Routes>
        <Route path="/auth/google" element={<GoogleRetorno />} />
        <Route path="*" element={<Onde />} />
      </Routes>
    </MemoryRouter>,
  );

describe("GoogleRetorno (login-com-google 03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refreshToken.mockResolvedValue({ access_token: "sessao" });
  });

  it("troca o cookie por sessão e vai para o voltar", async () => {
    montar("?voltar=%2Fconvite-colaborador%3Ftoken%3Dabc");

    expect((await screen.findByTestId("onde")).textContent).toBe(
      "/convite-colaborador?token=abc",
    );
    expect(doAuth).toHaveBeenCalledWith({ token: "sessao" });
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  it("sem voltar: dashboard", async () => {
    montar("");
    expect((await screen.findByTestId("onde")).textContent).toBe("/dashboard");
  });

  it("⚠️ voltar para outro domínio é ignorado", async () => {
    montar("?voltar=%2F%2Fsite-malicioso.com");
    expect((await screen.findByTestId("onde")).textContent).toBe("/dashboard");
  });

  it("refresh falhou: login com erro, sem sessão", async () => {
    refreshToken.mockRejectedValue(new Error("x"));
    montar("");
    await waitFor(() =>
      expect(screen.getByTestId("onde").textContent).toBe("/login?erro=google"),
    );
    expect(doAuth).not.toHaveBeenCalled();
  });
});
