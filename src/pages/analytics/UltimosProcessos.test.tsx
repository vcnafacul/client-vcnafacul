import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UltimoProcesso } from "@/services/analytics/monitoramento";
import { UltimosProcessos } from "./UltimosProcessos";

const processo = (over: Partial<UltimoProcesso> = {}): UltimoProcesso => ({
  id: "p1",
  nome: "Processo 2026",
  cursinho: { id: "c1", nome: "Cursinho Alfa" },
  inicio: "2026-01-10T00:00:00.000Z",
  fim: "2026-02-10T00:00:00.000Z",
  situacao: "encerrado",
  inscricoes: 120,
  matriculas: 40,
  ...over,
});

describe("UltimosProcessos (044/08)", () => {
  it("visão global: coluna Cursinho, período em pt-BR, situação e números", () => {
    render(
      <UltimosProcessos processos={[processo()]} carregando={false} mostrarCursinho />,
    );
    const tabela = screen.getByRole("table");
    expect(within(tabela).getByText("Cursinho")).toBeInTheDocument();
    expect(within(tabela).getByText("Cursinho Alfa")).toBeInTheDocument();
    expect(within(tabela).getByText("10/01/2026 – 10/02/2026")).toBeInTheDocument();
    expect(within(tabela).getByText("Encerrado")).toBeInTheDocument();
    expect(within(tabela).getByText("120")).toBeInTheDocument();
  });

  it("no recorte do cursinho, sem a coluna Cursinho", () => {
    render(
      <UltimosProcessos
        processos={[processo({ situacao: "aberto" })]}
        carregando={false}
        mostrarCursinho={false}
      />,
    );
    const tabela = screen.getByRole("table");
    expect(within(tabela).queryByText("Cursinho")).toBeNull();
    expect(within(tabela).getByText("Aberto")).toBeInTheDocument();
  });

  it("vazio e carregando", () => {
    const { rerender } = render(
      <UltimosProcessos processos={[]} carregando={false} mostrarCursinho />,
    );
    expect(screen.getByText("Nenhum processo seletivo ainda.")).toBeInTheDocument();
    rerender(<UltimosProcessos processos={[]} carregando mostrarCursinho />);
    expect(screen.getByLabelText("Carregando processos")).toBeInTheDocument();
  });
});
