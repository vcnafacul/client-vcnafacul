import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Roles } from "@/enums/roles/roles";
import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarDash } from ".";

vi.mock("@/components/chat/SupportInboxBadge", () => ({
  SupportInboxBadge: () => <a href="/dashboard/suporte">Atalho Suporte</a>,
}));
vi.mock("@/hooks/useFetch", () => ({ useFetch: () => ({ data: [] }) }));
vi.mock("@/store/auth", () => {
  const estado = { data: { permissao: { [Roles.supportAgent]: true } } };
  return {
    useAuthStore: (seletor?: (s: typeof estado) => unknown) =>
      seletor ? seletor(estado) : estado,
  };
});

function comLargura(mobile: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: mobile,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as never;
}

// No mobile a sidebar é uma gaveta: precisa estar aberta, senão nada do
// conteúdo dela está na tela e o teste passaria à toa.
function GavetaAberta() {
  const { setOpenMobile } = useSidebar();
  useEffect(() => setOpenMobile(true), [setOpenMobile]);
  return null;
}

const renderizar = () =>
  render(
    <MemoryRouter>
      <SidebarProvider defaultOpen>
        <GavetaAberta />
        <SidebarDash />
      </SidebarProvider>
    </MemoryRouter>,
  );

describe("SidebarDash — atalho de suporte no topo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("desktop (sidebar fixa) mostra o atalho para o agente de suporte", () => {
    comLargura(false);
    renderizar();

    expect(screen.getByText("Atalho Suporte")).toBeInTheDocument();
  });

  it("mobile/tablet (gaveta) não mostra o atalho", () => {
    comLargura(true);
    renderizar();

    // A gaveta abriu (o menu está na tela), mas sem o atalho no topo.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("Atalho Suporte")).not.toBeInTheDocument();
  });
});
