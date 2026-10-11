import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DISTANCIA_DO_HEADER, SidebarDash } from ".";

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
 * O primeiro card do menu fixo fica sempre a `DISTANCIA_DO_HEADER` do header — com tudo
 * fechado e com uma seção aberta. Antes ficava colado no header (fechado) e metade atrás dele
 * (aberto).
 *
 * ⚠️ No jsdom tudo mede 0: a lista "cairia" no topo, e a margem é o header (76) + a
 * distância. O que se prova é a regra (a mesma margem nos dois estados, e o 1º card sem a
 * margem própria); a medida real é do navegador.
 */
describe("SidebarDash — menu fixo à mesma distância do header nos dois estados", () => {
  const esperado = `${76 + DISTANCIA_DO_HEADER}px`;

  it("menu fixo: fechado e aberto, a mesma margem; o 1º card sem a margem própria", () => {
    comLargura(false);
    renderizar();
    expect(DISTANCIA_DO_HEADER).toBe(50);
    expect(lista().style.marginTop).toBe(esperado);
    expect(lista().className).toContain("[&>div:first-child>div:first-child]:!mt-0");

    fireEvent.click(screen.getByText("Cursinho"));
    expect(lista().style.marginTop).toBe(esperado);

    fireEvent.click(screen.getByText("Cursinho"));
    expect(lista().style.marginTop).toBe(esperado);
  });

  it("gaveta (até tablet): nada muda", () => {
    comLargura(true);
    renderizar();
    fireEvent.click(screen.getByText("Cursinho"));
    expect(lista().style.marginTop).toBe("");
    expect(lista().className).not.toContain("!mt-0");
  });
});
