import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { SimpleHistoryCard } from "./simpleHistoryCard";

const historico = (extra: Partial<HistoricoDTO> = {}) =>
  ({
    _id: "h1",
    usuario: "u1",
    ano: 2026,
    simulado: { _id: "s1", nome: "Simulado ENEM 1", questoes: [] },
    respostas: [],
    tempoRealizado: 3600,
    questoesRespondidas: 90,
    aproveitamento: { geral: 0.5, materias: [] },
    createdAt: "2026-09-20T12:00:00.000Z",
    ...extra,
  }) as unknown as HistoricoDTO;

describe("SimpleHistoryCard — tempo gasto", () => {
  it("simulado digital mostra o tempo", () => {
    render(<SimpleHistoryCard historico={historico()} />);

    expect(screen.getByText("Tempo Gasto")).toBeInTheDocument();
  });

  it("corrigido por cartão-resposta não mostra o tempo", () => {
    render(<SimpleHistoryCard historico={historico({ cartaoCode: "7" })} />);

    expect(screen.queryByText("Tempo Gasto")).not.toBeInTheDocument();
    expect(screen.getByText("Aproveitamento")).toBeInTheDocument();
  });
});
