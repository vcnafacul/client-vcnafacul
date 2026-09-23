import type { PontoDaSerie } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EvolucaoDoEstudante,
  TEXTO_SEM_APLICACAO,
  TEXTO_UMA_APLICACAO,
} from "./EvolucaoDoEstudante";

const ponto = (
  aproveitamento: number,
  mediaDoRecorte: number | null = 0.5,
  id = `s${aproveitamento}`,
): PontoDaSerie => ({
  simuladoId: id,
  nome: `Prova ${id}`,
  aproveitamento,
  em: "2026-03-10T00:00:00.000Z",
  mediaDoRecorte,
  baseDoRecorte: mediaDoRecorte === null ? 0 : 27,
});

const montar = (pontos: PontoDaSerie[]) =>
  render(<EvolucaoDoEstudante pontos={pontos} />);

describe("EvolucaoDoEstudante (card 17)", () => {
  it("⚠️ desenha as DUAS linhas — nunca só a do aluno", () => {
    /*
      A linha do aluno sozinha é o gráfico que mais convida à conclusão errada,
      e é o padrão em quase toda plataforma de simulado: dois simulados de
      dificuldade diferente não se comparam por percentual bruto.
    */
    const { container } = montar([ponto(0.4, 0.45), ponto(0.6, 0.5)]);

    expect(container.querySelector("[data-linha-aluno]")).toBeTruthy();
    expect(container.querySelector("[data-linha-turma]")).toBeTruthy();
  });

  it("⚠️ um ponto por aplicação, na ordem recebida", () => {
    const { container } = montar([
      ponto(0.4, 0.45, "a"),
      ponto(0.6, 0.5, "b"),
      ponto(0.7, 0.55, "c"),
    ]);

    const pontos = [...container.querySelectorAll("[data-ponto]")].map((el) =>
      el.getAttribute("data-ponto"),
    );
    expect(pontos).toEqual(["a", "b", "c"]);
  });

  it("⚠️ uma aplicação só NÃO vira gráfico, e diz por quê", () => {
    /*
      Um eixo com uma bolinha sugere tendência onde não há nenhuma. O card é
      explícito: "um ponto e uma explicação, não um gráfico vazio".
    */
    const { container } = montar([ponto(0.4)]);

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText(TEXTO_UMA_APLICACAO)).toBeTruthy();
    expect(container.querySelector("[data-evolucao-unica]")).toHaveTextContent(
      "40%",
    );
  });

  it("nenhuma aplicação mostra a mensagem, não um gráfico vazio", () => {
    const { container } = montar([]);

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText(TEXTO_SEM_APLICACAO)).toBeTruthy();
  });

  it("⚠️ o traço da turma FALHA no ponto sem média, em vez de atravessar", () => {
    /*
      Ligar os dois vizinhos desenharia uma reta cruzando a lacuna, e quem olha
      lê isso como "a turma manteve" — uma afirmação sobre um dado que não
      existe. O `M` no meio do caminho é o que interrompe o traço.
    */
    const { container } = montar([
      ponto(0.4, 0.45, "a"),
      ponto(0.5, null, "b"),
      ponto(0.6, 0.55, "c"),
    ]);

    const d = container
      .querySelector("[data-linha-turma]")!
      .getAttribute("d")!;
    // dois "M" = dois segmentos separados
    expect(d.match(/M/g)).toHaveLength(2);
  });

  it("⚠️ o eixo Y é 0–100% fixo — 100% no topo, e não o máximo do aluno", () => {
    /*
      Escalar ao mínimo e máximo do aluno transformaria uma variação de 2 pontos
      num gráfico dramático: o truque clássico de gráfico enganoso.
    */
    const { container } = montar([ponto(0.5, 0.5, "a"), ponto(0.52, 0.5, "b")]);

    const ys = [...container.querySelectorAll("[data-ponto]")].map((el) =>
      Number(el.getAttribute("cy")),
    );
    // 50% e 52% ficam quase no mesmo lugar — não nas duas pontas do gráfico
    expect(Math.abs(ys[0] - ys[1])).toBeLessThan(5);
  });

  it("a variação aparece em texto, com a da turma junto", () => {
    const { container } = montar([ponto(0.62, 0.6), ponto(0.55, 0.5)]);

    expect(container.querySelector("[data-variacao]")).toHaveTextContent(
      "−7 p.p.",
    );
    expect(container.querySelector("[data-variacao]")).toHaveTextContent(
      "a turma: −10 p.p.",
    );
  });

  it("⚠️ o resumo textual também é o rótulo acessível do gráfico", () => {
    // Um `<svg>` de polilinhas não diz nada a leitor de tela.
    const { container } = montar([ponto(0.4, 0.45), ponto(0.6, 0.5)]);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("p.p."),
    );
  });

  it("o tooltip de cada ponto traz a nota, a média e a base", () => {
    const { container } = montar([ponto(0.4, 0.45, "a"), ponto(0.6, 0.5, "b")]);

    const titulo = container.querySelector("[data-ponto='a'] title")!;
    expect(titulo.textContent).toContain("40%");
    expect(titulo.textContent).toContain("45%");
    expect(titulo.textContent).toContain("27");
  });
});
