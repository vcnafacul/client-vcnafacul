import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import SimulationHistoryCard from ".";

function historico(simulado: Partial<HistoricoDTO["simulado"]>) {
  return {
    _id: "h1",
    ano: 2026,
    usuario: "u1",
    simulado: { _id: "s1", nome: "Simulado ENEM 1", ...simulado },
    respostas: [],
    tempoRealizado: 3600,
    questoesRespondidas: 90,
    aproveitamento: { geral: 0.5, materias: [] },
    createdAt: "2026-09-20T12:00:00.000Z",
  } as unknown as HistoricoDTO;
}

function renderCard(h: HistoricoDTO) {
  return render(
    <MemoryRouter>
      <SimulationHistoryCard historico={h} />
    </MemoryRouter>,
  );
}

describe("SimulationHistoryCard", () => {
  it("mostra o nome da categoria e marca completo pelo total dela", () => {
    renderCard(
      historico({
        categoria: { nome: "ENEM Dia 1", quantidadeTotalQuestao: 90 } as never,
      }),
    );

    expect(screen.getByText("ENEM Dia 1")).toBeInTheDocument();
    expect(screen.getByText("Simulado Completo")).toBeInTheDocument();
  });

  it("⚠️ sem categoria (como o ms-simulado devolvia a lista) não quebra: usa o nome do simulado", () => {
    renderCard(historico({}));

    expect(screen.getByText("Simulado ENEM 1")).toBeInTheDocument();
    // Sem total não dá para afirmar que está completo.
    expect(screen.getByText("Simulado Incompleto")).toBeInTheDocument();
  });
});
