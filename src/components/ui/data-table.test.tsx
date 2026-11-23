import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DataTable, type DataTableColumn } from "./data-table";
import { StatusBadge } from "./status-badge";

// O jsdom não tem matchMedia: sem o mock a tabela cai no palpite "desktop".
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
  questoes: string;
  categoria: string;
}

const provas = (n: number): Prova[] =>
  Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    nome: `Prova ${i + 1}`,
    ano: 2000 + i,
    questoes: `${i}/180`,
    categoria: "ENEM",
  }));

const COLUNAS: DataTableColumn<Prova>[] = [
  { id: "nome", header: "Prova", cell: (r) => r.nome, sortable: true },
  { id: "ano", header: "Ano", cell: (r) => r.ano, align: "right", sortable: true },
  { id: "questoes", header: "Questões", cell: (r) => r.questoes, align: "right" },
  {
    id: "status",
    header: "Status",
    cell: () => <StatusBadge variant="success">Concluída</StatusBadge>,
  },
  { id: "categoria", header: "Categoria", cell: (r) => r.categoria },
];

describe("DataTable — paginação", () => {
  it('o rodapé mostra "Mostrando 11–20 de 45" na página 2 com 10 por página', () => {
    render(
      <DataTable
        columns={COLUNAS}
        rows={provas(45)}
        getRowId={(r) => r.id}
        pagination={{ page: 2, pageSize: 10, total: 45, onPageChange: vi.fn() }}
      />,
    );
    expect(screen.getByText("Mostrando 11–20 de 45")).toBeInTheDocument();
    // Paginação no cliente: a tabela recebe tudo e mostra só a página.
    expect(screen.getByText("Prova 11")).toBeInTheDocument();
    expect(screen.queryByText("Prova 10")).toBeNull();
    expect(screen.queryByText("Prova 21")).toBeNull();
  });

  it("com paginação no servidor, total caindo para 5 na página 3 volta para a página 1", async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(10)}
        getRowId={(r) => r.id}
        pagination={{ page: 3, pageSize: 10, total: 45, onPageChange }}
      />,
    );
    expect(onPageChange).not.toHaveBeenCalled();

    rerender(
      <DataTable
        columns={COLUNAS}
        rows={[]}
        getRowId={(r) => r.id}
        pagination={{ page: 3, pageSize: 10, total: 5, onPageChange }}
      />,
    );
    await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(1));
  });

  it.each(["loading", "error", "empty"] as const)(
    "em %s a página pedida (deep link) não volta para a 1, mesmo com total 0",
    (estado) => {
      const onPageChange = vi.fn();
      const { rerender } = render(
        <DataTable
          columns={COLUNAS}
          rows={[]}
          getRowId={(r) => r.id}
          state={estado}
          pagination={{ page: 3, pageSize: 10, total: 0, onPageChange }}
        />,
      );
      // Um callback novo a cada render da tela não pode reabrir o reset.
      rerender(
        <DataTable
          columns={COLUNAS}
          rows={[]}
          getRowId={(r) => r.id}
          state={estado}
          pagination={{ page: 3, pageSize: 10, total: 0, onPageChange: vi.fn() }}
        />,
      );
      expect(onPageChange).not.toHaveBeenCalled();
    },
  );

  it("Próxima chama onPageChange com a página seguinte", () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={COLUNAS}
        rows={provas(10)}
        getRowId={(r) => r.id}
        pagination={{ page: 1, pageSize: 10, total: 45, onPageChange }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("DataTable — mobile", () => {
  beforeEach(() => larguraDeTela(false));

  it("no mobile, as linhas viram cartões pelos papéis padrão", () => {
    const { container } = render(
      <DataTable columns={COLUNAS} rows={provas(2)} getRowId={(r) => r.id} />,
    );
    expect(container.querySelector("table")).toBeNull();

    const cartao = container.querySelector('[data-row-key="2"]') as HTMLElement;
    // Primeira coluna = título; as duas seguintes = meta com " · "; StatusBadge = status; o resto some.
    expect(within(cartao).getByText("Prova 2")).toBeInTheDocument();
    expect(cartao.querySelector('[data-mobile-role="meta"]')?.textContent).toBe("2001 · 1/180");
    expect(
      within(cartao.querySelector('[data-mobile-role="status"]') as HTMLElement).getByText(
        "Concluída",
      ),
    ).toBeInTheDocument();
    expect(within(cartao).queryByText("ENEM")).toBeNull();
  });

  it("o papel explícito vence o padrão", () => {
    const colunas: DataTableColumn<Prova>[] = COLUNAS.map((c) =>
      c.id === "ano" ? { ...c, mobile: "hidden" } : c.id === "categoria" ? { ...c, mobile: "meta" } : c,
    );
    const { container } = render(
      <DataTable columns={colunas} rows={provas(2)} getRowId={(r) => r.id} />,
    );
    const cartao = container.querySelector('[data-row-key="2"]') as HTMLElement;
    expect(cartao.querySelector('[data-mobile-role="meta"]')?.textContent).toBe("1/180 · ENEM");
  });

  it("seleção e ações da linha aparecem no cartão", () => {
    const { container } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(2)}
        getRowId={(r) => r.id}
        selection={[]}
        onSelectionChange={vi.fn()}
        rowActions={() => [{ id: "editar", label: "Editar", onSelect: vi.fn() }]}
      />,
    );
    const cartao = container.querySelector('[data-row-key="1"]') as HTMLElement;
    expect(within(cartao).getByRole("checkbox")).toBeInTheDocument();
    expect(within(cartao).getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
  });

  it("marcar a caixa do cartão seleciona sem abrir a linha", () => {
    const onRowClick = vi.fn();
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(2)}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        selection={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    const cartao = container.querySelector('[data-row-key="2"]') as HTMLElement;
    fireEvent.click(within(cartao).getByRole("checkbox", { name: "Selecionar Prova 2" }));
    expect(onSelectionChange).toHaveBeenCalledWith(["2"]);
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(within(cartao).getByRole("button", { name: "Prova 2" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("renderMobileCard substitui o cartão derivado", () => {
    render(
      <DataTable
        columns={COLUNAS}
        rows={provas(1)}
        getRowId={(r) => r.id}
        renderMobileCard={(r) => <p>Cartão de {r.nome}</p>}
      />,
    );
    expect(screen.getByText("Cartão de Prova 1")).toBeInTheDocument();
  });
});

describe("DataTable — ordenação, seleção e estados", () => {
  it("clicar no cabeçalho chama onSortChange e não reordena as linhas", () => {
    const onSortChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(3)}
        getRowId={(r) => r.id}
        sort={{ columnId: "nome", direction: "desc" }}
        onSortChange={onSortChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ano/ }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: "ano", direction: "asc" });
    expect(
      [...container.querySelectorAll("[data-row-key]")].map((e) => e.getAttribute("data-row-key")),
    ).toEqual(["1", "2", "3"]);
    const ordenada = container.querySelector('th[aria-sort="descending"]') as HTMLElement;
    expect(ordenada.className).toContain("text-foreground");
  });

  it("selecionar uma linha mostra a barra com a contagem e as ações em lote", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(3)}
        getRowId={(r) => r.id}
        selection={[]}
        onSelectionChange={onSelectionChange}
        bulkActions={<button type="button">Exportar</button>}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Prova 2" }));
    expect(onSelectionChange).toHaveBeenCalledWith(["2"]);
    expect(screen.queryByText("Exportar")).toBeNull();

    rerender(
      <DataTable
        columns={COLUNAS}
        rows={provas(3)}
        getRowId={(r) => r.id}
        selection={["2"]}
        onSelectionChange={onSelectionChange}
        bulkActions={<button type="button">Exportar</button>}
      />,
    );
    expect(screen.getByText("1 item selecionado")).toBeInTheDocument();
    expect(screen.getByText("Exportar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["2", "1", "3"]);
  });

  it("isRowSelectable desabilita a caixa das outras linhas e o cabeçalho só marca as que podem", () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={COLUNAS}
        rows={provas(3)}
        getRowId={(r) => r.id}
        selection={[]}
        onSelectionChange={onSelectionChange}
        isRowSelectable={(r) => r.id !== "2"}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Selecionar Prova 2" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Selecionar Prova 1" })).toBeEnabled();

    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["1", "3"]);
  });

  it("a caixa da linha e o ⋯ não disparam o clique da linha", () => {
    // Sem abrir o menu: abrir um menu do Radix leva uns 15s no jsdom e estoura na suíte cheia.
    const onRowClick = vi.fn();
    const { container } = render(
      <DataTable
        columns={COLUNAS}
        rows={provas(2)}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
        selection={[]}
        onSelectionChange={vi.fn()}
        rowActions={() => [{ id: "editar", label: "Editar prova", onSelect: vi.fn() }]}
      />,
    );
    const linha = container.querySelector('[data-row-key="1"]') as HTMLElement;
    fireEvent.click(within(linha).getByRole("checkbox"));
    fireEvent.click(within(linha).getByRole("button", { name: "Mais ações" }));
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(linha);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("vazio mostra o título, a dica e Limpar filtros", () => {
    const onClearFilters = vi.fn();
    render(
      <DataTable
        columns={COLUNAS}
        rows={[]}
        getRowId={(r) => r.id}
        empty={{ title: "Nenhuma prova encontrada", hint: "Tente outros filtros." }}
        onClearFilters={onClearFilters}
      />,
    );
    expect(screen.getByText("Nenhuma prova encontrada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it("carregando mostra linhas de skeleton e nenhum dado", () => {
    render(
      <DataTable columns={COLUNAS} rows={provas(3)} getRowId={(r) => r.id} state="loading" />,
    );
    expect(screen.getAllByTestId("table-skeleton-row").length).toBeGreaterThan(0);
    expect(screen.queryByText("Prova 1")).toBeNull();
  });

  it("erro mostra o alerta e Tentar de novo chama onRetry", () => {
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={COLUNAS}
        rows={[]}
        getRowId={(r) => r.id}
        state="error"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onRetry).toHaveBeenCalled();
  });
});
