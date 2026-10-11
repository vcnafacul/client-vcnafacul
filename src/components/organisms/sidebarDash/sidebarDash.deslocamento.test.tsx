import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DESLOCAMENTO_COM_SECAO_ABERTA, SidebarDash } from ".";

const { Icone } = vi.hoisted(() => ({ Icone: () => null }));

vi.mock("@/pages/dash/data", () => ({
  adminMenuItems: [
    {
      id: 1,
      bg: "bg-marine",
      title: "Cursinho",
      image: Icone,
      alt: "cursinho",
      subMenuList: [{ icon: Icone, alt: "ps", text: "Processo seletivo", link: "/ps" }],
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

function comLargura(mobile: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: mobile,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as never;
}

function GavetaAberta() {
  const { setOpenMobile } = useSidebar();
  useEffect(() => setOpenMobile(true), [setOpenMobile]);
  return null;
}

const lista = () =>
  document.querySelector('[data-sidebar="menu"]') as HTMLElement;

const renderizar = () =>
  render(
    <MemoryRouter>
      <SidebarProvider defaultOpen>
        <GavetaAberta />
        <SidebarDash />
      </SidebarProvider>
    </MemoryRouter>,
  );

/**
 * No menu fixo, abrir "Cursinho" encolhia os cards e o primeiro ficava metade atrás do
 * header. Com uma seção aberta, a lista desce metade de um card + 100px — só no menu fixo.
 */
describe("SidebarDash — deslocamento com uma seção aberta", () => {
  it("menu fixo: sem seção aberta, sem deslocamento; aberta, desce metade do card + 100px", () => {
    comLargura(false);
    renderizar();
    expect(lista().style.marginTop).toBe("");

    fireEvent.click(screen.getByText("Cursinho"));
    expect(DESLOCAMENTO_COM_SECAO_ABERTA).toBe("calc(4rem / 2 + 100px)");
    // (o jsdom normaliza o calc: 4rem / 2 vira 2rem, e reordena os termos)
    expect(lista().style.marginTop).toMatch(/2rem/);
    expect(lista().style.marginTop).toMatch(/100px/);

    // fechar a seção volta ao normal
    fireEvent.click(screen.getByText("Cursinho"));
    expect(lista().style.marginTop).toBe("");
  });

  it("gaveta (até tablet): não desloca", () => {
    comLargura(true);
    renderizar();
    fireEvent.click(screen.getByText("Cursinho"));
    expect(lista().style.marginTop).toBe("");
  });
});
