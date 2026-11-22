import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SendQuest from "./sendQuest";

const montar = (onSubmit = vi.fn(), cursos: string[] = []) =>
  render(
    <SendQuest
      onSubmit={onSubmit}
      back={vi.fn()}
      selectedCourse={cursos}
      selectedField={[]}
      processing={false}
      photoDone={false}
    />,
  );

describe("SendQuest", () => {
  it("agrupa as áreas sob o título da seção", () => {
    montar();
    expect(
      screen.getByRole("group", { name: /Áreas com mais dificuldades/ }),
    ).toBeInTheDocument();
  });

  it("marca e desmarca as áreas com dificuldade", () => {
    montar();
    const caixas = screen.getAllByRole("checkbox");
    fireEvent.click(caixas[0]);
    expect(caixas[0]).toBeChecked();
    fireEvent.click(caixas[0]);
    expect(caixas[0]).not.toBeChecked();
  });

  it("remove um curso escolhido pelo botão com nome acessível", () => {
    montar(vi.fn(), ["Medicina"]);
    fireEvent.click(screen.getByRole("button", { name: "Remover Medicina" }));
    expect(screen.getByText("Nenhum curso selecionado.")).toBeInTheDocument();
  });

  it("expõe a busca de curso como combobox rotulado", () => {
    montar();
    expect(
      screen.getByRole("combobox", { name: "Digite para buscar um curso" }),
    ).toHaveTextContent("Ex: Medicina, Engenharia...");
  });
});
