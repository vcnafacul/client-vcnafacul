import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SimuladoResumo } from "../../../dtos/prova/prova";

// Força o layout do celular (abaixo de 768px).
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));
vi.mock("../../../services/cartaoResposta/baixarCartao", () => ({
  baixarCartao: vi.fn(),
}));
vi.mock("../../../services/caderno/baixarCaderno", () => ({
  baixarCaderno: vi.fn(),
}));
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao: vi.fn(async () => ({ simulados: [] })),
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(), update: vi.fn(), info: vi.fn() },
}));

import SimuladosView from "./simuladosView";

const simulado = (i: number): SimuladoResumo =>
  ({
    _id: `s${i}`,
    nome: `Simulado ${i}`,
    categoria: { nome: "Linguagens", quantidadeTotalQuestao: 45 },
    questoes: [],
    bloqueado: false,
  }) as unknown as SimuladoResumo;

describe("SimuladosView no celular", () => {
  it("cards sem tabela, com nome, categoria e as ações à vista", () => {
    render(
      <SimuladosView
        simulados={[simulado(1), simulado(2)]}
        loading={false}
        error={null}
        token="tok"
        onVoltar={vi.fn()}
        onRetry={vi.fn()}
        onSimuladoUpdated={vi.fn()}
        relatorio={{ aoAbrir: vi.fn(), permitido: true }}
      />,
    );

    expect(screen.queryByRole("table")).toBeNull();
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    const card = within(cards[0]);
    expect(card.getByText("Simulado 1")).toBeInTheDocument();
    expect(card.getByText("Linguagens")).toBeInTheDocument();
    expect(
      card.getByRole("button", { name: /baixar cartão de resposta/i }),
    ).toBeInTheDocument();
    expect(
      card.getByRole("button", { name: /janela de disponibilidade/i }),
    ).toBeInTheDocument();
  });
});
