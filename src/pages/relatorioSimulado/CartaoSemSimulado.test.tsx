import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("./AcaoDeReenvio", () => ({
  AcaoDeReenvio: ({ historicoId }: { historicoId: string }) => (
    <button>reenviar-{historicoId}</button>
  ),
}));
vi.mock("./BaixarFotoDoCartao", () => ({
  BaixarFotoDoCartao: () => <button>baixar-foto</button>,
}));
vi.mock("./ExcluirEnvioDoCartao", () => ({
  ExcluirEnvioDoCartao: () => <button>excluir-envio</button>,
}));

import {
  CartaoSemSimulado,
  TEXTO_AGUARDANDO_IDIOMA,
} from "./CartaoSemSimulado";
import { simuladoDaLinha } from "./fonteDoRelatorio";

const linha = (o: object = {}) =>
  ({
    usuario: "u1",
    nome: "Ana",
    matricula: "2025001",
    enviouCartao: true,
    simuladoId: null,
    historicoId: "h1",
    status: "awaiting_omr",
    ...o,
  }) as never;

describe("CartaoSemSimulado (tickets/038 · 14)", () => {
  it("aguardando: explica que o simulado sai do idioma; foto e excluir disponíveis", () => {
    render(
      <CartaoSemSimulado token="t" linha={linha()} onClose={vi.fn()} onMudou={vi.fn()} />,
    );
    expect(screen.getByText(TEXTO_AGUARDANDO_IDIOMA)).toBeInTheDocument();
    expect(screen.getByText("baixar-foto")).toBeInTheDocument();
    expect(screen.getByText("excluir-envio")).toBeInTheDocument();
    expect(screen.queryByText(/reenviar/)).toBeNull();
  });

  it("⚠️ falhou antes do idioma: o motivo e o Reenviar", () => {
    render(
      <CartaoSemSimulado
        token="t"
        linha={linha({
          status: "failed",
          falha: { codigo: "cartao_nao_detectado", descricao: "Cartão não encontrado na foto." },
        })}
        onClose={vi.fn()}
        onMudou={vi.fn()}
      />,
    );
    expect(screen.getByText("Cartão não encontrado na foto.")).toBeInTheDocument();
    expect(screen.getByText("reenviar-h1")).toBeInTheDocument();
  });
});

describe("simuladoDaLinha com o cartão sem simulado", () => {
  it("null não cai no simulado da tela: não há detalhe a buscar", () => {
    expect(
      simuladoDaLinha({ tipo: "prova", provaId: "p1" }, { simuladoId: null }),
    ).toBeUndefined();
    expect(
      simuladoDaLinha({ tipo: "prova", provaId: "p1" }, { simuladoId: "s1" }),
    ).toBe("s1");
  });
});
