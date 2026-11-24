import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader, PageHeaderBar, PageShell } from "./page-header";

const classes = (el: Element) => el.getAttribute("class")?.split(/\s+/) ?? [];

describe("PageHeader", () => {
  it("o título é o h1 da página, em text-h3 (o mesmo do DashToolbar)", () => {
    render(<PageHeader title="Períodos Letivos" />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Períodos Letivos" });
    expect(classes(h1)).toEqual(expect.arrayContaining(["text-h3", "font-semibold", "text-foreground"]));
  });

  it("subtítulo, voltar e ações", () => {
    render(
      <PageHeader
        title="Turmas"
        subtitle="3 turmas"
        backButton={<button type="button">Voltar</button>}
        actions={<button type="button">Nova turma</button>}
      />,
    );
    expect(screen.getByText("3 turmas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nova turma" })).toBeInTheDocument();
  });

  it("é uma faixa branca com borda; o conteúdo extra (filtros) fica dentro dela", () => {
    render(
      <PageHeader title="Turmas">
        <div>filtros</div>
      </PageHeader>,
    );
    const card = screen.getByTestId("page-header");
    expect(classes(card)).toEqual(expect.arrayContaining(["rounded-md", "border", "border-border", "bg-card"]));
    expect(card).toContainElement(screen.getByText("filtros"));
  });

  it("título e subtítulo quebram linha em vez de cortar (detalhes têm subtítulo longo)", () => {
    render(<PageHeader title="Turma A" subtitle="Período: 2026 · Início: 01/03/2026 · Alunos: 30" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const sub = screen.getByText(/Período: 2026/);
    for (const el of [h1, sub]) {
      expect(classes(el)).toContain("break-words");
      expect(classes(el)).not.toContain("truncate");
    }
  });

  it("sem ações, não renderiza o grupo de ações", () => {
    render(<PageHeaderBar title="Conta" />);
    expect(screen.queryByTestId("page-header-actions")).not.toBeInTheDocument();
  });
});

describe("PageShell", () => {
  it("fundo bg-page e coluna central de até 1400px", () => {
    render(<PageShell>conteúdo</PageShell>);
    const coluna = screen.getByText("conteúdo");
    expect(classes(coluna)).toEqual(expect.arrayContaining(["mx-auto", "max-w-page-wide", "px-4", "py-6"]));
    expect(classes(coluna.parentElement!)).toContain("bg-page");
  });
});
