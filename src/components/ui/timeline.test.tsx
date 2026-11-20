import { render, screen, within } from "@testing-library/react";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Timeline, TimelineItem } from "./timeline";

// 14:30 em São Paulo (UTC-3).
const QUANDO = new Date("2026-11-12T17:30:00Z");

function montar() {
  return render(
    <Timeline>
      <TimelineItem icon={Pencil} variant="info" who="Ana" what="editou o enunciado" when={QUANDO} />
      <TimelineItem
        icon={XCircle}
        variant="destructive"
        who="Bruno"
        what="rejeitou a questão"
        when={QUANDO}
        detail="A alternativa C está duplicada."
      />
      <TimelineItem icon={CheckCircle2} variant="success" who="Carla" what="aprovou" when={QUANDO} />
    </Timeline>,
  );
}

describe("Timeline", () => {
  it("é um <ol> com um <li> por evento", () => {
    const { container } = montar();
    const lista = container.querySelector("ol") as HTMLElement;
    expect(lista).not.toBeNull();
    expect(within(lista).getAllByRole("listitem")).toHaveLength(3);
  });

  it("o último item não tem a linha de ligação", () => {
    const { container } = montar();
    const itens = [...container.querySelectorAll("ol > li")];
    expect(itens[0].querySelector("[data-slot='timeline-connector']")).not.toBeNull();
    expect(itens[1].querySelector("[data-slot='timeline-connector']")).not.toBeNull();
    expect(itens[2].querySelector("[data-slot='timeline-connector']")).toBeNull();
  });

  it("mostra quem, o quê, quando no fuso de São Paulo e o detalhe", () => {
    montar();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getByText("rejeitou a questão")).toBeInTheDocument();
    expect(screen.getAllByText("12/11/2026 às 14:30")[0].tagName).toBe("TIME");
    expect(screen.getByText("A alternativa C está duplicada.")).toBeInTheDocument();
  });

  it('state="empty" mostra o vazio no lugar da lista', () => {
    render(<Timeline state="empty" empty={{ title: "Nenhum evento ainda" }} />);
    expect(screen.getByText("Nenhum evento ainda")).toBeInTheDocument();
  });
});
