import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalBaixarCartao, TEXTO_BAIXAR_CARTAO } from "./ModalBaixarCartao";
import { LINK_SABER_MAIS_LEITURA, ORIENTACOES } from "./OrientacoesDoCartao";

/**
 * O modal de orientações antes de baixar o cartão.
 *
 * ⚠️ **Um teste, uma abertura do diálogo.** Cada diálogo Radix aberto custa segundos de CPU no
 * jsdom e o custo vaza para os testes seguintes da suíte — por isso conteúdo, link, cancelar e
 * baixar são conferidos na mesma montagem. Como o modal é controlado (`aberto` fixo aqui),
 * "Cancelar" só avisa (`onFechar`) e o diálogo continua na tela para o "Baixar".
 */
describe("ModalBaixarCartao", () => {
  it("mostra as orientações e o Saber mais; Cancelar avisa e Baixar baixa", () => {
    const onFechar = vi.fn();
    const onBaixar = vi.fn();
    render(
      <ModalBaixarCartao
        nomeSimulado="Simulado 1"
        aberto
        onFechar={onFechar}
        onBaixar={onBaixar}
      />,
    );

    expect(screen.getByText(/Simulado 1\./)).toBeInTheDocument();
    for (const o of ORIENTACOES) {
      expect(screen.getByText(`${o.titulo}.`)).toBeInTheDocument();
    }
    const link = screen.getByRole("link", { name: /saber mais/i });
    expect(link).toHaveAttribute("href", LINK_SABER_MAIS_LEITURA);
    expect(link).toHaveAttribute("target", "_blank");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onFechar).toHaveBeenCalled();
    expect(onBaixar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: TEXTO_BAIXAR_CARTAO }));
    expect(onBaixar).toHaveBeenCalledTimes(1);
  });
});
