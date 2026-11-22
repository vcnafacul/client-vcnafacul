import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExpandableTable from "@/components/organisms/expandableTable";

const dados = [
  { materia: "Matemática", frente: "Álgebra", temas: 3 },
  { materia: "Matemática", frente: "Geometria", temas: 2 },
  { materia: "Física", frente: "Mecânica", temas: 4 },
];

const montar = () =>
  render(
    <ExpandableTable
      data={dados}
      columns={[
        { key: "groupKey", label: "Matéria" },
        { key: "total", label: "Temas", align: "right" },
      ]}
      groupBy={(d) => d.materia}
      aggregate={(itens) => ({
        total: itens.reduce((acc, i) => acc + i.temas, 0),
      })}
      expandableContent={(itens) => (
        <ul>
          {itens.map((i) => (
            <li key={i.frente}>{i.frente}</li>
          ))}
        </ul>
      )}
      expandableTitle="Frentes"
    />,
  );

describe("ExpandableTable", () => {
  it("agrupa e soma por matéria", () => {
    montar();
    expect(
      screen.getByRole("rowheader", { name: "Matemática" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Física" })).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("expande e recolhe com aria-expanded e aria-controls", () => {
    montar();
    const botao = screen.getByRole("button", {
      name: "Expandir frentes de Matemática",
    });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Álgebra")).toBeNull();

    fireEvent.click(botao);
    const aberto = screen.getByRole("button", {
      name: "Recolher frentes de Matemática",
    });
    expect(aberto).toHaveAttribute("aria-expanded", "true");
    expect(
      document.getElementById(aberto.getAttribute("aria-controls") as string),
    ).toContainElement(screen.getByText("Geometria"));

    fireEvent.click(aberto);
    expect(screen.queryByText("Álgebra")).toBeNull();
  });
});
