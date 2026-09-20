import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header, { type HeaderData } from "@/components/organisms/header";
import DashTemplate from "@/components/templates/dashTemplate";
import { BaseTemplateContext } from "@/context/baseTemplateContext";

/**
 * ⚠️ jsdom não avalia `@media print`: o que dá para afirmar aqui é que as
 * classes `print:hidden` / `print:top-0 print:h-auto print:block` estão
 * presentes no DOM. O resultado visual real — header e sidebar somem, e o
 * conteúdo sobe para o topo da folha — é gate manual, registrado no PR.
 */

// `SidebarDash` busca matérias reais ao montar; mockado para não bater rede.
vi.mock("@/services/content/getMateriasGroupedByArea", () => ({
  getMateriasGroupedByArea: vi.fn().mockResolvedValue([]),
}));

/**
 * O `useIsMobile` do sidebar chama `window.matchMedia`, que o jsdom não
 * implementa. Mesmo mock usado em `DashTable.test.tsx` e
 * `DashListTemplate.test.tsx` — sem ele o componente quebra ao montar.
 */
function mockMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: false,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

const item = (id: number, name: string) => ({
  Home_Menu_Item_id: { id, name, link: "/x", target: "_self" },
});

// Header lê `userNavigationSign[0]` e `[1]` por índice (via `Sign`), então o
// mínimo que não quebra é dois itens.
const headerData: HeaderData = {
  pageLinks: [],
  socialLinks: [],
  userNavigationSign: [item(1, "Entrar"), item(2, "Cadastrar")],
  userNavigationLogged: [],
};

describe("impressão", () => {
  beforeEach(() => mockMatchMedia());

  it("o header sai da folha impressa", () => {
    // ⚠️ `Header` exige `solid` e usa `useBaseTemplateContext` + `Link`s do
    // router. Sem heavy scaffolding — Router e o Context são o mínimo que o
    // componente pede para não lançar; nenhum serviço externo é chamado.
    const { container } = render(
      <MemoryRouter>
        <BaseTemplateContext.Provider value={{ header: headerData, hasFooter: false }}>
          <Header solid={false} />
        </BaseTemplateContext.Provider>
      </MemoryRouter>,
    );

    expect(container.querySelector(".print\\:hidden")).toBeTruthy();
  });

  /**
   * ⚠️ Monta o `DashTemplate` inteiro (com `hasMenu`, que traz o
   * `SidebarDash` real) em vez de isolar `DashTemplateContent` — este não é
   * exportado, e exportá-lo só para o teste seria mudar produção por causa do
   * teste. A montagem completa também prova as três peças (header, sidebar,
   * wrapper) juntas, do jeito que a tela de verdade as compõe.
   */
  it("o sidebar da dash e o wrapper zeram o offset na impressão", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/dash"]}>
        <Routes>
          <Route path="/dash" element={<DashTemplate hasMenu />}>
            <Route index element={<div>conteúdo</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // O wrapper que hoje carrega `top-[76px] h-[calc(100vh-76px)]` precisa
    // reverter os dois na impressão, e voltar a `block` (o `flex` de tela
    // empurraria o sidebar escondido para o lado do conteúdo).
    //
    // ⚠️ Seletor pela classe `top-[76px]`, escapada: `.flex.flex-row` sozinho
    // também casa com um `MenuItem` do `Header` mais acima na árvore.
    const wrapper = container.querySelector(".top-\\[76px\\]");
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveClass("print:top-0", "print:h-auto", "print:block");

    // A div que envolve o `SidebarDash` e o próprio `Sidebar` (shadcn) saem
    // da impressão — duas classes, porque o `className` do `Sidebar` cai no
    // seu `div` interno fixo, não no wrapper que o `DashTemplate` controla.
    const escondidos = container.querySelectorAll(".print\\:hidden");
    expect(escondidos.length).toBeGreaterThanOrEqual(3); // header + wrapper do sidebar + Sidebar interno
  });
});
