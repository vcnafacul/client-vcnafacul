import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { permissao: { gerenciadorDemanda: true, editarMateriasFrentes: true } },
  }),
}));
vi.mock("./renderTemasTable", () => ({
  RenderTemasTable: () => <p>tabela de temas</p>,
}));

import { ExpandableFrente } from "./expandableFrente";
import { SortableTemaRow } from "./sortableTemaRow";

const frente = { _id: "f1", id: "f1", nome: "Álgebra" } as never;
const temas = [{ _id: "t1", id: "t1", name: "Funções", contents: [] }] as never;

function tabela(ui: React.ReactNode) {
  return render(
    <table>
      <tbody>{ui}</tbody>
    </table>,
  );
}

describe("ExpandableFrente", () => {
  const props = {
    frente,
    temas,
    onEditFrente: vi.fn(),
    onAddTema: vi.fn(),
    onUpdateTema: vi.fn(),
    onDeleteTema: vi.fn(),
    onReorderTemas: vi.fn(),
  };

  it("expande e recolhe os temas, com aria-expanded e aria-controls", () => {
    tabela(<ExpandableFrente {...props} />);
    const botao = screen.getByRole("button", { name: /Expandir temas de Álgebra/ });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("tabela de temas")).toBeNull();

    fireEvent.click(botao);
    const aberto = screen.getByRole("button", { name: /Recolher temas de Álgebra/ });
    expect(aberto).toHaveAttribute("aria-expanded", "true");
    const alvo = aberto.getAttribute("aria-controls") as string;
    expect(document.getElementById(alvo)).toContainElement(
      screen.getByText("tabela de temas"),
    );

    fireEvent.click(aberto);
    expect(screen.queryByText("tabela de temas")).toBeNull();
  });

  it("sem temas, não há o que expandir", () => {
    tabela(<ExpandableFrente {...props} temas={[]} />);
    expect(screen.queryByRole("button", { name: /Expandir/ })).toBeNull();
  });
});

describe("SortableTemaRow", () => {
  it("a alça de arraste continua ligada ao dnd-kit", () => {
    render(
      <DndContext>
        <SortableContext items={["t1"]}>
          <table>
            <tbody>
              <SortableTemaRow
                tema={(temas as unknown as Array<Record<string, unknown>>)[0] as never}
                onEdit={vi.fn()}
                onReorderContents={vi.fn()}
              />
            </tbody>
          </table>
        </SortableContext>
      </DndContext>,
    );
    const alca = screen.getByRole("button", {
      name: "Arrastar o tema Funções para reordenar",
    });
    expect(alca).toHaveAttribute("aria-roledescription", "sortable");
    expect(screen.getByText("0/0", { selector: "td:nth-child(3)" })).toBeInTheDocument();
  });
});
