import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { List, ListItem } from "./list";

describe("List", () => {
  it('state="error" mostra um Alert e "Tentar de novo" chama onRetry', () => {
    const onRetry = vi.fn();
    render(
      <List state="error" onRetry={onRetry}>
        <ListItem title="Ana" />
      </List>,
    );
    const alerta = screen.getByRole("alert");
    fireEvent.click(within(alerta).getByRole("button", { name: "Tentar de novo" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Ana")).toBeNull();
  });

  it('state="empty" mostra o título vazio', () => {
    render(
      <List
        state="empty"
        empty={{ title: "Nenhuma chamada registrada", hint: "As chamadas da turma aparecem aqui." }}
      />,
    );
    expect(screen.getByText("Nenhuma chamada registrada")).toBeInTheDocument();
    expect(screen.getByText("As chamadas da turma aparecem aqui.")).toBeInTheDocument();
  });

  it("ready renderiza os itens com meta unida por ·, selos e o fim", () => {
    render(
      <List>
        <ListItem
          title="Ana Souza"
          meta={["Turma A", "3 faltas"]}
          badges={<span>Bolsista</span>}
          trailing={<button type="button">Ver</button>}
        />
      </List>,
    );
    const item = screen.getByRole("listitem");
    expect(within(item).getByText("Ana Souza")).toBeInTheDocument();
    expect(item.querySelector("[data-slot='list-item-meta']")?.textContent).toBe(
      "Turma A · 3 faltas",
    );
    expect(within(item).getByText("Bolsista")).toBeInTheDocument();
    expect(within(item).getByRole("button", { name: "Ver" })).toBeInTheDocument();
  });

  it('state="loading" mostra o skeleton e anuncia que carrega', () => {
    const { container } = render(<List state="loading" />);
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
    expect(screen.queryByRole("listitem")).toBeNull();
  });
});
