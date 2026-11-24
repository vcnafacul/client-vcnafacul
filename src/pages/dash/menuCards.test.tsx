import { render, screen } from "@testing-library/react";
import { Book } from "lucide-react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DashCard, { DashCardMenu } from "@/components/molecules/dashCard";
import {
  adminMenuItems,
  buildAcademicMenuItems,
  fallbackAcademicMenuItems,
  studentMenuItem,
} from "@/pages/dash/data";

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile: false, setOpenMobile: vi.fn() }),
}));
vi.mock("@/store/auth", () => {
  const estado = { data: { permissao: {} } };
  return {
    useAuthStore: (seletor?: (s: typeof estado) => unknown) =>
      seletor ? seletor(estado) : estado,
  };
});

const card: DashCardMenu = {
  id: 1,
  bg: "bg-identity-linguagens",
  title: "Linguagens",
  image: Book,
  alt: "Linguagens",
  subMenuList: [{ icon: Book, alt: "artes", text: "Artes", link: "/x" }],
};

const classes = (el: Element) => el.getAttribute("class")?.split(/\s+/) ?? [];

describe("DashCard — card inteiro na cor de identidade", () => {
  for (const size of ["big", "small"] as const) {
    it(`${size}: fundo identity-<card> com texto identity-foreground`, () => {
      render(
        <MemoryRouter>
          <DashCard card={card} size={size} opened={false} />
        </MemoryRouter>,
      );
      const c = classes(screen.getByText("Linguagens").parentElement!);
      expect(c).toEqual(
        expect.arrayContaining(["bg-identity-linguagens", "text-identity-foreground"]),
      );
      for (const proibida of ["bg-cta", "bg-primary", "text-white"])
        expect(c).not.toContain(proibida);
    });
  }
});

describe("cards do menu da dash — cores", () => {
  const todos = [...adminMenuItems, ...fallbackAcademicMenuItems, studentMenuItem];

  it("todo card usa um token identity-<card>, nunca cta, primary ou status", () => {
    for (const c of todos) expect(c.bg, c.title).toMatch(/^bg-identity-[a-z]+$/);
  });

  it("cada card tem a sua cor (nenhuma repetida)", () => {
    const cores = todos.map((c) => c.bg);
    expect(new Set(cores).size).toBe(cores.length);
  });

  it("as áreas vindas da API ganham a mesma cor do fallback", () => {
    const areas = ["Linguagens", "Ciências da Natureza", "Ciências Humanas", "Matemática"];
    const itens = buildAcademicMenuItems(
      areas.map((enemArea) => ({ enemArea, materias: [] }) as never),
    );
    expect(itens.map((i) => i.bg)).toEqual(fallbackAcademicMenuItems.map((i) => i.bg));
  });
});
