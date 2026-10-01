import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarDash } from ".";

const { Icone } = vi.hoisted(() => ({ Icone: () => null }));

vi.mock("@/pages/dash/data", () => ({
  adminMenuItems: [
    {
      id: 1,
      bg: "bg-marine",
      title: "Cursinho",
      image: Icone,
      alt: "cursinho",
      subMenuList: [
        { icon: Icone, alt: "ps", text: "Processo seletivo", link: "/ps" },
        { icon: Icone, alt: "turmas", text: "Turmas", link: "/turmas" },
      ],
    },
  ],
  buildAcademicMenuItems: () => [],
  fallbackAcademicMenuItems: [],
  studentMenuItem: {
    id: 99,
    bg: "bg-green",
    title: "Estudante",
    image: Icone,
    alt: "estudante",
    subMenuList: [],
  },
}));
vi.mock("@/hooks/useFetch", () => ({ useFetch: () => ({ data: [] }) }));
vi.mock("@/store/auth", () => {
  const estado = { data: { permissao: {} } };
  return {
    useAuthStore: (seletor?: (s: typeof estado) => unknown) =>
      seletor ? seletor(estado) : estado,
  };
});

// Fora da gaveta, como o botão do header.
function AbrirMenu() {
  const { setOpenMobile } = useSidebar();
  return <button onClick={() => setOpenMobile(true)}>Abrir menu</button>;
}

const renderizar = () =>
  render(
    <MemoryRouter>
      <SidebarProvider>
        <AbrirMenu />
        <SidebarDash />
      </SidebarProvider>
    </MemoryRouter>,
  );

const submenuDoCursinho = () =>
  within(screen.getByRole("dialog")).getByTestId("submenu");

describe("SidebarDash na gaveta — seção aberta ao reabrir o menu", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;
  });

  it("navegar fecha o menu; ao reabrir, a seção segue aberta com os subitens", () => {
    renderizar();

    fireEvent.click(screen.getByText("Abrir menu"));
    fireEvent.click(screen.getByText("Cursinho"));
    expect(submenuDoCursinho()).toHaveStyle({ gridTemplateRows: "1fr" });

    // Clicar num subitem navega e fecha a gaveta (desmonta os cards).
    fireEvent.click(screen.getByText("Processo seletivo"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Abrir menu"));

    expect(submenuDoCursinho()).toHaveStyle({ gridTemplateRows: "1fr" });
    expect(screen.getByText("Turmas")).toBeVisible();
  });

  it("depois de reabrir, um clique só fecha a seção", () => {
    renderizar();

    fireEvent.click(screen.getByText("Abrir menu"));
    fireEvent.click(screen.getByText("Cursinho"));
    fireEvent.click(screen.getByText("Processo seletivo"));
    fireEvent.click(screen.getByText("Abrir menu"));

    fireEvent.click(screen.getByText("Cursinho"));

    expect(submenuDoCursinho()).toHaveStyle({ gridTemplateRows: "0fr" });
  });
});
