import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressoCell } from "./ProgressoCell";
import {
  faixasDoProgresso,
  progressoOrdenavel,
  TEXTO_SEM_QUESTOES,
  tituloDoProgresso,
} from "./progresso";

const contagens = (
  totalQuestao: number,
  totalQuestaoCadastradas: number,
  totalQuestaoValidadas: number,
) => ({ totalQuestao, totalQuestaoCadastradas, totalQuestaoValidadas });

/** Largura da faixa, em número, como o browser a receberia. */
function largura(faixa: "validadas" | "pendentes"): number {
  const el = document.querySelector<HTMLElement>(`[data-faixa="${faixa}"]`);
  if (!el) throw new Error(`faixa "${faixa}" não renderizada`);
  return Number.parseFloat(el.style.width);
}

describe("faixasDoProgresso", () => {
  it("132 validadas de 180, com 160 cadastradas, dá 73,3% verde e 15,6% laranja", () => {
    const faixas = faixasDoProgresso(contagens(180, 160, 132));
    expect(faixas).not.toBeNull();
    expect(faixas!.pctValidadas).toBeCloseTo((132 / 180) * 100, 5);
    expect(faixas!.pctPendentes).toBeCloseTo((28 / 180) * 100, 5);
  });

  /**
   * ⚠️ **A divisão por zero.** Existe prova com `totalQuestao: 0` no banco. A
   * variante ingênua desta função (`validadas === total ? 100 : ...`) devolve
   * 100% — uma prova sem uma única questão anunciada como pronta.
   */
  it("prova com totalQuestao 0 devolve null — nunca 100%", () => {
    expect(faixasDoProgresso(contagens(0, 0, 0))).toBeNull();
    expect(faixasDoProgresso(contagens(0, 12, 12))).toBeNull();
  });

  it("contagem acima do total é saneada para caber no trilho", () => {
    const faixas = faixasDoProgresso(contagens(180, 200, 190))!;
    expect(faixas.pctValidadas).toBe(100);
    expect(faixas.pctPendentes).toBe(0);
    expect(faixas.pctValidadas + faixas.pctPendentes).toBeLessThanOrEqual(100);
  });

  it("as duas faixas nunca somam mais de 100", () => {
    const faixas = faixasDoProgresso(contagens(10, 8, 5))!;
    expect(faixas.pctValidadas).toBe(50);
    expect(faixas.pctPendentes).toBe(30);
  });
});

describe("progressoOrdenavel", () => {
  it("é validadas / total", () => {
    expect(progressoOrdenavel(contagens(180, 160, 90))).toBeCloseTo(0.5, 10);
  });

  it("prova sem questão vale 0, e não explode nem vira Infinity", () => {
    const v = progressoOrdenavel(contagens(0, 0, 0));
    expect(v).toBe(0);
    expect(Number.isFinite(v)).toBe(true);
  });

  it("ordena a prova incompleta antes da completa", () => {
    expect(progressoOrdenavel(contagens(180, 180, 90))).toBeLessThan(
      progressoOrdenavel(contagens(180, 180, 180)),
    );
  });
});

describe("tituloDoProgresso", () => {
  it("traz as três contagens cruas", () => {
    // Cruas de propósito: sanear aqui esconderia o dado inconsistente de quem
    // pode corrigi-lo.
    expect(tituloDoProgresso(contagens(180, 200, 190))).toBe(
      "180 questões · 200 cadastradas · 190 validadas",
    );
  });
});

describe("<ProgressoCell>", () => {
  it("desenha as duas faixas e o texto validadas/total", () => {
    render(<ProgressoCell prova={contagens(180, 160, 132)} />);

    expect(screen.getByTestId("progresso")).toHaveAttribute(
      "title",
      "180 questões · 160 cadastradas · 132 validadas",
    );
    expect(screen.getByText("132/180")).toBeInTheDocument();
    expect(largura("validadas")).toBeCloseTo(73.333, 2);
    expect(largura("pendentes")).toBeCloseTo(15.555, 2);
  });

  /** ⚠️ O caso que este ticket existe para não mentir. */
  it("prova com totalQuestao 0 não desenha barra nem sugere conclusão", () => {
    render(<ProgressoCell prova={contagens(0, 0, 0)} />);

    const celula = screen.getByTestId("progresso");
    expect(celula).toHaveTextContent(TEXTO_SEM_QUESTOES);
    expect(celula).toHaveAttribute("data-sem-questoes", "true");
    expect(document.querySelector('[data-faixa="validadas"]')).toBeNull();
    expect(celula.textContent).not.toContain("100");
    expect(celula.textContent).not.toContain("0/0");
  });

  it("prova sem nenhuma questão validada mostra a barra vazia, não cheia", () => {
    render(<ProgressoCell prova={contagens(50, 0, 0)} />);
    expect(largura("validadas")).toBe(0);
    expect(largura("pendentes")).toBe(0);
    expect(screen.getByText("0/50")).toBeInTheDocument();
  });
});
