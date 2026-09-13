import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashTable } from "./DashTable";
import { LINHAS_SKELETON, TEXTO_TENTAR_DE_NOVO, TEXTO_VAZIO } from "./DashTableEmpty";
import { StatusBadge } from "./StatusBadge";
import { dashV2 } from "./tokens";
import type { DashColumn } from "./types";

/**
 * ⚠️ O `sm` deste projeto é 768px — não o default do Tailwind. E o jsdom não
 * implementa `matchMedia`: sem este mock o componente cai no palpite "desktop"
 * e o teste de mobile não testaria nada.
 */
function larguraDeTela(acimaDeSm: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)" ? acimaDeSm : !acimaDeSm,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => larguraDeTela(true));

interface Prova {
  id: string;
  nome: string;
  ano: number;
  faltando: number;
}

const p = (id: string, nome: string, ano = 2019, faltando = 0): Prova => ({
  id,
  nome,
  ano,
  faltando,
});

const LINHAS = [p("1", "ENEM 2019"), p("2", "Fuvest 2020", 2020), p("3", "Unicamp 2021", 2021)];

const COLUNAS: DashColumn<Prova>[] = [
  { id: "nome", header: "Nome", cell: (r) => r.nome, sortValue: (r) => r.nome, primary: true },
  { id: "ano", header: "Ano", cell: (r) => r.ano, sortValue: (r) => r.ano, align: "right" },
  { id: "faltando", header: "Faltando", cell: (r) => r.faltando, hideBelow: "md" },
  {
    id: "status",
    header: "Status",
    cell: (r) => <StatusBadge tone={r.faltando > 0 ? "missing" : "done"} label="Estado" />,
  },
];

function montar(props: Partial<React.ComponentProps<typeof DashTable<Prova>>> = {}) {
  return render(
    <DashTable rows={LINHAS} columns={COLUNAS} rowKey={(r) => r.id} {...props} />,
  );
}

const linhasVisiveis = (c: HTMLElement) =>
  [...c.querySelectorAll("[data-row-key]")].map((el) => el.getAttribute("data-row-key"));

describe("DashTable — ordenação", () => {
  it("a tabela NÃO reordena rows por conta própria: ela só avisa", () => {
    /**
     * ⚠️ O critério central do componente. Se a tabela ordenasse sozinha, a
     * tela perderia a escolha entre ordenar em memória e pedir ordenado ao
     * servidor — e as duas ordenações brigariam.
     *
     * `rows` chega numa ordem que o `sort` contradiz de propósito.
     */
    const onSortChange = vi.fn();
    const { container } = montar({
      sort: { columnId: "nome", direction: "desc" },
      onSortChange,
    });

    expect(linhasVisiveis(container)).toEqual(["1", "2", "3"]);
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it("clicar no cabeçalho só chama onSortChange — a ordem na tela não muda", () => {
    const onSortChange = vi.fn();
    const { container } = montar({ onSortChange });

    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));

    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(linhasVisiveis(container)).toEqual(["1", "2", "3"]);
  });

  it("o ciclo é inativa → asc → desc → asc, sem terceiro estado", () => {
    const onSortChange = vi.fn();
    const { rerender } = montar({ onSortChange });

    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "nome", direction: "asc" });

    rerender(
      <DashTable
        rows={LINHAS}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        sort={{ columnId: "nome", direction: "asc" }}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "nome", direction: "desc" });

    rerender(
      <DashTable
        rows={LINHAS}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        sort={{ columnId: "nome", direction: "desc" }}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "nome", direction: "asc" });
  });

  it.each(["asc", "desc"] as const)(
    "trocar de coluna começa em asc, mesmo com a anterior em %s",
    (direcao) => {
      /**
       * ⚠️ O caso `asc` é o que pega o bug de verdade: se o ciclo esquecer de
       * comparar `columnId` e tratar toda coluna como "a ativa", clicar numa
       * coluna nova com a anterior em `asc` devolve `desc` — e a lista abre
       * invertida sem ninguém ter pedido. Com a anterior em `desc` o bug
       * devolve `asc` por acaso e passa despercebido.
       */
      const onSortChange = vi.fn();
      montar({ sort: { columnId: "nome", direction: direcao }, onSortChange });

      fireEvent.click(screen.getByRole("button", { name: /Ano/ }));
      expect(onSortChange).toHaveBeenLastCalledWith({ columnId: "ano", direction: "asc" });
    },
  );

  it("aria-sort reflete os três estados da coluna ordenável", () => {
    const { container, rerender } = montar();
    const th = () => container.querySelector("th:first-child") as HTMLElement;

    expect(th().getAttribute("aria-sort")).toBe("none");

    rerender(
      <DashTable
        rows={LINHAS}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        sort={{ columnId: "nome", direction: "asc" }}
      />,
    );
    expect(th().getAttribute("aria-sort")).toBe("ascending");

    rerender(
      <DashTable
        rows={LINHAS}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        sort={{ columnId: "nome", direction: "desc" }}
      />,
    );
    expect(th().getAttribute("aria-sort")).toBe("descending");
  });

  it("coluna sem sortValue não é clicável, não tem seta e não anuncia aria-sort", () => {
    const { container } = montar();
    const ths = [...container.querySelectorAll("th")];
    const faltando = ths.find((t) => t.textContent?.includes("Faltando")) as HTMLElement;

    expect(faltando.querySelector("button")).toBeNull();
    expect(faltando.querySelector("svg")).toBeNull();
    expect(faltando.hasAttribute("aria-sort")).toBe(false);
  });

  it("a seta muda com a direção ativa", () => {
    const { container, rerender } = montar({ sort: { columnId: "nome", direction: "asc" } });
    const setaDe = (i: number) =>
      (container.querySelectorAll("th")[i].querySelector("svg") as SVGElement).getAttribute(
        "class",
      );

    const asc = setaDe(0);
    rerender(
      <DashTable
        rows={LINHAS}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        sort={{ columnId: "nome", direction: "desc" }}
      />,
    );
    const desc = setaDe(0);
    // Coluna inativa fica com a seta neutra, diferente das duas.
    const neutra = setaDe(1);

    expect(asc).not.toBe(desc);
    expect(neutra).not.toBe(asc);
    expect(neutra).not.toBe(desc);
  });
});

describe("DashTable — linhas", () => {
  it("a key da linha é o rowKey, não o índice: reordenar não recria o DOM", () => {
    // ⚠️ Com `key={index}` — que é o que o template do V1 faz — o React reusa o
    // nó da posição e a lista pisca ao reordenar.
    const { container, rerender } = montar();
    const antes = container.querySelector('[data-row-key="3"]');

    rerender(
      <DashTable rows={[LINHAS[2], LINHAS[0], LINHAS[1]]} columns={COLUNAS} rowKey={(r) => r.id} />,
    );

    expect(linhasVisiveis(container)).toEqual(["3", "1", "2"]);
    expect(container.querySelector('[data-row-key="3"]')).toBe(antes);
  });

  it("a coluna primary é um <button> real e dispara a ação uma única vez", () => {
    // ⚠️ Uma vez, não duas: o clique no botão sobe para a linha, que também é
    // clicável. Sem stopPropagation o modal abriria duplicado.
    const onRowClick = vi.fn();
    montar({ onRowClick });

    fireEvent.click(screen.getByRole("button", { name: "Fuvest 2020" }));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(LINHAS[1]);
  });

  it("clicar na linha também dispara, e o cursor só vira pointer quando há ação", () => {
    const onRowClick = vi.fn();
    const { container, rerender } = montar({ onRowClick });

    const linha = container.querySelector('[data-row-key="2"]') as HTMLElement;
    expect(linha.className).toContain("cursor-pointer");
    fireEvent.click(linha);
    expect(onRowClick).toHaveBeenCalledWith(LINHAS[1]);

    rerender(<DashTable rows={LINHAS} columns={COLUNAS} rowKey={(r) => r.id} />);
    expect(
      (container.querySelector('[data-row-key="2"]') as HTMLElement).className,
    ).not.toContain("cursor-pointer");
  });

  it("sem onRowClick a coluna primary não vira botão", () => {
    montar();
    expect(screen.queryByRole("button", { name: "Fuvest 2020" })).toBeNull();
    expect(screen.getByText("Fuvest 2020")).toBeInTheDocument();
  });

  it("nome longo trunca e o texto completo fica no title", () => {
    const nome = "ENEM 2019 — Segunda aplicação, reaplicação para pessoas privadas de liberdade";
    const { container } = render(
      <DashTable rows={[p("x", nome)]} columns={COLUNAS} rowKey={(r) => r.id} />,
    );

    const celula = container.querySelector('[data-column-id="nome"] > span') as HTMLElement;
    expect(celula.className).toContain("truncate");
    expect(celula.getAttribute("title")).toBe(nome);
  });

  it("célula que não é texto não ganha title inventado", () => {
    // O StatusBadge é um nó React; `title` teria que sair de um toString() que
    // não existe.
    const { container } = montar();
    const status = container.querySelector('[data-column-id="status"] > span') as HTMLElement;
    expect(status.hasAttribute("title")).toBe(false);
  });

  it("a densidade sai dos tokens do 02", () => {
    const { container, rerender } = montar({ density: "compact" });
    expect((container.querySelector("[data-row-key]") as HTMLElement).className).toContain(
      dashV2.row.compact,
    );

    rerender(<DashTable rows={LINHAS} columns={COLUNAS} rowKey={(r) => r.id} density="base" />);
    expect((container.querySelector("[data-row-key]") as HTMLElement).className).toContain(
      dashV2.row.base,
    );
  });

  it("hideBelow esconde a coluna por CSS, sem duplicar nada no DOM", () => {
    const { container } = montar();
    const ths = [...container.querySelectorAll("th")];
    const faltando = ths.find((t) => t.textContent?.includes("Faltando")) as HTMLElement;

    expect(faltando.className).toContain("hidden");
    expect(faltando.className).toContain("md:table-cell");
    // Uma única ocorrência do cabeçalho — nada de segunda cópia escondida.
    expect(ths.filter((t) => t.textContent?.includes("Faltando"))).toHaveLength(1);
  });
});

describe("DashTable — cabeçalho fixo", () => {
  it("o cabeçalho é sticky por default e o fundo é opaco", () => {
    const { container } = montar();
    for (const th of container.querySelectorAll("th")) {
      expect(th.className).toContain("sticky");
      expect(th.className).toContain("top-0");
      expect(th.className).toContain(dashV2.surface);
    }
  });

  it("stickyHeader={false} desliga", () => {
    const { container } = montar({ stickyHeader: false });
    expect((container.querySelector("th") as HTMLElement).className).not.toContain("sticky");
  });

  it("não há ancestral com overflow entre o <table> e a raiz do componente", () => {
    /**
     * ⚠️ É o que quebraria o sticky sem barulho nenhum: um ancestral com
     * `overflow` vira o scrollport, e como ele não tem altura o cabeçalho
     * gruda num contêiner que nunca rola. É exatamente o `div.overflow-auto`
     * que o wrapper `<Table>` do shadcn traz — por isso ele fica de fora.
     */
    const { container } = montar();
    const raiz = screen.getByTestId("dash-table");
    let el: HTMLElement | null = container.querySelector("table");
    for (; el && el !== raiz; el = el.parentElement) {
      expect(el.className, el.tagName).not.toMatch(/overflow-(auto|scroll|hidden)/);
    }
    expect(raiz.className).not.toMatch(/overflow-(auto|scroll|hidden)/);
  });
});

describe("DashTable — estados", () => {
  it("loading mostra skeleton com o mesmo número de colunas, e o cabeçalho fica", () => {
    const { container } = montar({ state: "loading" });

    const linhas = screen.getAllByTestId("dash-table-skeleton-row");
    expect(linhas).toHaveLength(LINHAS_SKELETON);
    for (const l of linhas) expect(l.querySelectorAll("td")).toHaveLength(COLUNAS.length);

    // O cabeçalho é o que fixa a largura no `table-fixed`: sem ele as colunas
    // saltariam quando os dados chegassem.
    expect(container.querySelectorAll("th")).toHaveLength(COLUNAS.length);
    expect(container.querySelectorAll("[data-row-key]")).toHaveLength(0);
  });

  it("loading não mostra dado nenhum, mesmo com rows na mão", () => {
    montar({ state: "loading" });
    expect(screen.queryByText("Fuvest 2020")).toBeNull();
  });

  it("error mostra 'Tentar novamente' e o clique chama onRetry", () => {
    const onRetry = vi.fn();
    montar({ state: "error", onRetry });

    fireEvent.click(screen.getByRole("button", { name: TEXTO_TENTAR_DE_NOVO }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("error sem onRetry não oferece um botão que não faz nada", () => {
    montar({ state: "error" });
    expect(screen.getByTestId("dash-table-erro")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: TEXTO_TENTAR_DE_NOVO })).toBeNull();
  });

  it("error tem precedência sobre a lista vazia", () => {
    // Falhar e dizer "nenhum registro encontrado" é a interface mentindo.
    montar({ rows: [], state: "error" });
    expect(screen.getByTestId("dash-table-erro")).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO)).toBeNull();
  });

  it("lista vazia mostra o default quando a tela não passa emptyState", () => {
    montar({ rows: [] });
    expect(screen.getByText(TEXTO_VAZIO)).toBeInTheDocument();
  });

  it("emptyState da tela substitui o default", () => {
    // ⚠️ Vazio por filtro e vazio por não existir nada são mensagens
    // diferentes, e quem sabe distinguir é a tela.
    montar({ rows: [], emptyState: <p>Nenhuma prova bate com esses filtros</p> });
    expect(screen.getByText("Nenhuma prova bate com esses filtros")).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO)).toBeNull();
  });

  it("o vazio ocupa a largura inteira da tabela", () => {
    const { container } = montar({ rows: [] });
    const td = container.querySelector("tbody td") as HTMLElement;
    expect(td.getAttribute("colspan")).toBe(String(COLUNAS.length));
  });
});

describe("DashTable — abaixo de 768px", () => {
  beforeEach(() => larguraDeTela(false));

  it("vira lista empilhada e o <table> some do DOM — sem duas cópias do conteúdo", () => {
    /**
     * ⚠️ Renderizar as duas versões e esconder uma com CSS põe o mesmo
     * conteúdo duas vezes no DOM, e leitor de tela lê as duas. Mesma decisão
     * do `DashToolbar`, mesmo hook.
     */
    const { container } = montar({ onRowClick: vi.fn() });

    expect(container.querySelector("table")).toBeNull();
    expect(screen.getByTestId("dash-table").getAttribute("data-modo")).toBe("lista");
    expect(screen.getAllByText("Fuvest 2020")).toHaveLength(1);
    expect(linhasVisiveis(container)).toEqual(["1", "2", "3"]);
  });

  it("não há scroll horizontal: nenhum contêiner com overflow-x", () => {
    const { container } = montar();
    for (const el of container.querySelectorAll("*")) {
      expect(el.className.toString()).not.toMatch(/overflow-x-(auto|scroll)/);
    }
  });

  it("mostra a coluna primary em cima, duas abaixo e a última à direita", () => {
    const { container } = montar({ onRowClick: vi.fn() });
    const bloco = container.querySelector('[data-row-key="2"]') as HTMLElement;

    expect(within(bloco).getByRole("button", { name: "Fuvest 2020" })).toBeInTheDocument();
    // `faltando` tem hideBelow e não entra; sobram `ano` abaixo e `status` à direita.
    expect([...bloco.querySelectorAll("[data-column-id]")].map((e) =>
      e.getAttribute("data-column-id"),
    )).toEqual(["ano", "status"]);
  });

  it("os estados continuam valendo na lista", () => {
    const { rerender } = montar({ state: "loading" });
    expect(screen.getAllByTestId("dash-table-skeleton-row")).toHaveLength(LINHAS_SKELETON);

    const onRetry = vi.fn();
    rerender(
      <DashTable
        rows={[]}
        columns={COLUNAS}
        rowKey={(r) => r.id}
        state="error"
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: TEXTO_TENTAR_DE_NOVO }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<DashTable rows={[]} columns={COLUNAS} rowKey={(r) => r.id} />);
    expect(screen.getByText(TEXTO_VAZIO)).toBeInTheDocument();
  });
});

describe("DashTable — acessibilidade e paleta", () => {
  it("todo focável usa o anel laranja e nenhum anel azul sobra", () => {
    const { container } = montar({ onRowClick: vi.fn(), onSortChange: vi.fn() });

    const focaveis = [...container.querySelectorAll("button, [tabindex='0']")];
    expect(focaveis.length).toBeGreaterThan(0);
    for (const el of focaveis) {
      expect(el.className, el.textContent ?? "").toContain("focus-visible:ring-orange/40");
      expect(el.className).not.toMatch(/ring-blue|focus:ring-blue|outline-blue/);
    }
  });

  it("nenhuma cor do Tailwind default vaza para o markup", () => {
    // ⚠️ A catraca do `02` guarda o `tokens.ts`, não este componente.
    const { container } = montar({ onRowClick: vi.fn() });
    const todas = [...container.querySelectorAll("*")]
      .map((e) => e.getAttribute("class") ?? "")
      .join(" ");
    expect(todas).not.toMatch(/-(?:blue|slate|gray|zinc|neutral|stone)-\d/);
  });

  it("a tabela mantém a semântica nativa: leitor de tela anuncia linha e coluna", () => {
    montar();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(COLUNAS.length);
    expect(screen.getAllByRole("row")).toHaveLength(LINHAS.length + 1);
  });
});
