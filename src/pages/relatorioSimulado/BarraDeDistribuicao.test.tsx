import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { BarraDeDistribuicao } from "./BarraDeDistribuicao";

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 34,
  questaoId: "q34",
  // ⚠️ Coerente com a invariante da api: `sum(porAlternativa) + semLeitura ===
  // respondentes` (25 + 2 = 27), e `porAlternativa[correta] === acertos` (C=6).
  // Um fixture que a viola faz os testes de soma afirmarem o que a api nunca
  // produz — foi o que aconteceu na primeira versão deste arquivo.
  respondentes: 27,
  acertos: 6,
  erros: 19,
  semLeitura: 2,
  porAlternativa: { A: 2, B: 16, C: 6, D: 1, E: 0 },
  alternativaCorreta: "C",
  discriminacao: 0.4,
  ...over,
});

describe("BarraDeDistribuicao", () => {
  it("⚠️ as contagens exatas continuam alcançáveis — a barra é a forma", () => {
    /*
      ⚠️ Saíram do `title` para a `DicaRapida` (300ms num portal): o atraso do
      `title` é do navegador, ~1s, e não é configurável.

      Aqui a asserção é no `aria-label`, que tem o mesmo texto e não depende de
      hover — é o que quem usa leitor de tela recebe.
    */
    render(<BarraDeDistribuicao questao={questao()} />);

    const titulo = screen.getByRole("img").getAttribute("aria-label")!;
    expect(titulo).toContain("A: 2");
    expect(titulo).toContain("B: 16");
    expect(titulo).toContain("C: 6");
    expect(titulo).toContain("sem leitura: 2");
    expect(titulo).toContain("27");
  });

  it("⚠️ tem rótulo acessível — não é decoração", () => {
    // `role="img"` sem nome acessível é pior que nada: o leitor de tela anuncia
    // "imagem" e o conteúdo inteiro fica inalcançável.
    render(<BarraDeDistribuicao questao={questao()} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/distribui/i);
  });

  it("⚠️ o gabarito é marcado por BORDA, não só por cor", () => {
    // Nenhuma cor desta paleta carrega significado sozinha — `green3` mede
    // 3.77:1. Mesma regra do `rotuloDoResultado` e do card 04.
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    const gabarito = container.querySelector("[data-gabarito]")!;
    expect(gabarito.className).toMatch(/ring/);
  });

  it("⚠️ o gabarito leva a LETRA, e não só a marca visual", () => {
    render(<BarraDeDistribuicao questao={questao({ alternativaCorreta: "B" })} />);

    expect(screen.getByText("B ✓")).toBeInTheDocument();
  });

  it("gabarito `null` não marca nem rotula nada", () => {
    const { container } = render(
      <BarraDeDistribuicao questao={questao({ alternativaCorreta: null })} />,
    );

    expect(container.querySelector("[data-gabarito]")).toBeNull();
    expect(screen.queryByText(/✓/)).not.toBeInTheDocument();
  });

  it("sem respondentes mostra travessão, não barra vazia", () => {
    render(
      <BarraDeDistribuicao
        questao={questao({ respondentes: 0, porAlternativa: {}, semLeitura: 0 })}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });

});

describe("BarraDeDistribuicao — a dica de 300ms", () => {
  /**
   * Relatado na revisão: a dica da barra ainda levava ~1s, como a dos sinais
   * antes do conserto. O atraso do `title` nativo é do navegador e **não é
   * configurável**.
   */
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("⚠️ não usa mais o `title` nativo", () => {
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    expect(container.querySelector("[title]")).toBeNull();
  });

  it("abre em 300ms, com as contagens exatas", () => {
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    fireEvent.mouseEnter(container.querySelector('[data-dica="distribuicao"]')!);
    act(() => void vi.advanceTimersByTime(300));

    expect(screen.getByRole("tooltip")).toHaveTextContent("B: 16");
  });

  it("⚠️ não abre antes disso", () => {
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    fireEvent.mouseEnter(container.querySelector('[data-dica="distribuicao"]')!);
    act(() => void vi.advanceTimersByTime(250));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("⚠️ o `aria-label` continua — a dica é `pointer-events-none`", () => {
    // Quem usa leitor de tela não passa o mouse, e a dica não é focável.
    render(<BarraDeDistribuicao questao={questao()} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/B: 16/);
  });
});

describe("⚠️ a largura da barra", () => {
  /**
   * A barra ENCOLHEU ao ganhar a dica: o wrapper `inline-flex` da `DicaRapida`
   * entrou entre o container flex e a barra, e o `w-full` dela passou a medir
   * 100% de um elemento que encolheu até o conteúdo — sobrando só o
   * `min-w-[6rem]`.
   *
   * ⚠️ jsdom não calcula layout, então o que se afirma aqui é a CLASSE no
   * elemento certo. O efeito visual continua sendo gate manual — foi
   * exatamente o que escapou.
   */
  it("o wrapper da dica recebe `flex-1`, senão a barra encolhe", () => {
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    const wrapper = container.querySelector('[data-dica="distribuicao"]')!;
    expect(wrapper.className).toContain("flex-1");
  });

  it("⚠️ e `min-w-0`: sem ele o `flex-1` não encolhe abaixo do conteúdo", () => {
    // Item de flex tem `min-width: auto` por padrão, e o `min-w-[6rem]` da
    // barra viraria um piso que empurra as colunas vizinhas.
    const { container } = render(<BarraDeDistribuicao questao={questao()} />);

    expect(
      container.querySelector('[data-dica="distribuicao"]')!.className,
    ).toContain("min-w-0");
  });

  it("a barra em si continua com `w-full`", () => {
    render(<BarraDeDistribuicao questao={questao()} />);

    expect(screen.getByRole("img").className).toContain("w-full");
  });
});
