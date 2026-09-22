import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";

const resumo = (over: Partial<Resumo> = {}): Resumo => ({
  totalNoRecorte: 30,
  comLeituraConcluida: 27,
  aproveitamentoGeral: 0.62,
  totalEstudantesComCartaoNoCursinho: 27,
  temEstudanteSemTurma: false,
  linhasSemEstudanteAtivo: 0,
    totalDeQuestoes: 90,
    simuladoNome: "ENEM 2024",
    turmaNome: null,
    ultimoCartaoEm: "2026-09-21T15:30:00.000Z",
  ...over,
});

describe("ResumoDoRelatorio", () => {
  it("⚠️ mostra as DUAS contagens — sem elas a média parece errada", () => {
    // ⚠️ Card 09: os dois números viraram "27 de 30" no bloco `Cobertura`, em
    // vez de dois `text-2xl` soltos. O que o teste protege é o mesmo: sem eles
    // ninguém entende a diferença entre "30 alunos" e "27 no cálculo".
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText("27 de 30")).toBeInTheDocument();
  });

  it("⚠️ o rótulo é 'No cálculo da média', não 'Com leitura concluída'", () => {
    // a api conta aqui só quem é `completed` E tem nota numérica; o badge da
    // tabela diz "Lido" pelo status sozinho. Com o rótulo antigo, uma linha
    // concluída sem nota põe 28 badges "Lido" em cima de um número 27.
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText(/no cálculo da média/i)).toBeInTheDocument();
    expect(screen.queryByText(/com leitura concluída/i)).not.toBeInTheDocument();
  });

  it("média nula vira travessão, não 0%", () => {
    render(<ResumoDoRelatorio resumo={resumo({ aproveitamentoGeral: null })} />);

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("⚠️ diz que o recorte é só cartão-resposta", () => {
    // sem isto, a primeira pergunta da semana é "cadê o fulano?" — quem
    // respondeu digital não entra neste relatório
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText(/cart[ãa]o-resposta/i)).toBeInTheDocument();
  });

  it("linhasSemEstudanteAtivo vira nota quando há", () => {
    render(
      <ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 2 })} />,
    );

    // ⚠️ A contagem é conferida DENTRO da nota, não solta na tela: o próprio
    // resumo já mostra "27" e "62%", então um `/2/` no documento inteiro casa
    // com três nós e não prova que a nota trouxe o número.
    const nota = screen.getByText(/não estão mais/i);

    expect(nota).toBeInTheDocument();
    expect(nota).toHaveTextContent("2");
  });

  it("⚠️ e a nota SOME quando é zero — não escrever '0 estudantes saíram'", () => {
    render(
      <ResumoDoRelatorio resumo={resumo({ linhasSemEstudanteAtivo: 0 })} />,
    );

    expect(screen.queryByText(/não estão mais/i)).not.toBeInTheDocument();
  });
});

describe("ResumoDoRelatorio — distribuição (card 09)", () => {
  const dist = (over = {}) => ({
    base: 10,
    mediana: 52,
    minimo: 31,
    maximo: 84,
    q1: 44,
    q3: 71,
    ...over,
  });

  const faixas = [
    { de: 0, ate: 11, quantos: 0 },
    { de: 12, ate: 22, quantos: 1 },
    { de: 23, ate: 34, quantos: 3 },
    { de: 35, ate: 45, quantos: 4 },
    { de: 46, ate: 56, quantos: 2 },
    { de: 57, ate: 67, quantos: 0 },
    { de: 68, ate: 79, quantos: 0 },
    { de: 80, ate: 90, quantos: 0 },
  ];

  it("mostra mediana, quartis e faixa ao lado da média", () => {
    render(<ResumoDoRelatorio resumo={resumo()} distribuicao={dist()} />);

    const bloco = screen.getByTestId("resumo-distribuicao");
    expect(bloco).toHaveTextContent("mediana 52");
    expect(bloco).toHaveTextContent("entre 44 e 71");
    expect(bloco).toHaveTextContent("31–84");
  });

  it("⚠️ a média continua lá — a mediana acompanha, não substitui", () => {
    // As duas juntas é que denunciam a assimetria: com um aluno que zerou, a
    // média despenca e a mediana não.
    render(<ResumoDoRelatorio resumo={resumo()} distribuicao={dist()} />);

    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("média")).toBeInTheDocument();
  });

  it("⚠️ base insuficiente não mostra distribuição nenhuma", () => {
    // Tudo `null` vindo do cálculo. Mediana de 2 alunos é afirmação sem
    // conteúdo — e um travessão em quatro campos seria pior que a ausência.
    render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={dist({ mediana: null, q1: null, q3: null, base: 3 })}
      />,
    );

    expect(screen.queryByTestId("resumo-distribuicao")).not.toBeInTheDocument();
  });

  it("sem distribuição nenhuma, o resumo ainda renderiza", () => {
    // É o estado antes de a tela calcular, e o da aba que não passa a prop.
    render(<ResumoDoRelatorio resumo={resumo()} />);

    expect(screen.getByText("27 de 30")).toBeInTheDocument();
  });

  it("desenha o histograma quando há faixas", () => {
    render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={dist()}
        faixas={faixas}
      />,
    );

    expect(screen.getByTestId("histograma-da-turma")).toBeInTheDocument();
  });

  it("⚠️ sem faixas, nenhum histograma — e não um gráfico vazio", () => {
    render(<ResumoDoRelatorio resumo={resumo()} distribuicao={dist()} />);

    expect(screen.queryByTestId("histograma-da-turma")).not.toBeInTheDocument();
  });

  it("⚠️ o histograma NÃO é `print:hidden` — é conteúdo, não controle", () => {
    // É a coisa mais útil da folha impressa: "a turma é bimodal?" se responde
    // de relance por ele e por nenhum número.
    render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={dist()}
        faixas={faixas}
      />,
    );

    expect(screen.getByTestId("histograma-da-turma").className).not.toContain(
      "print:hidden",
    );
  });

  it("⚠️ o histograma tem rótulo acessível com os números exatos", () => {
    // A forma é a leitura rápida; quem usa leitor de tela e quem precisa do
    // número têm de chegar neles.
    render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={dist()}
        faixas={faixas}
      />,
    );

    expect(screen.getByRole("img")).toHaveAccessibleName(
      expect.stringContaining("35–45: 4"),
    );
  });

  it("⚠️ barra de faixa VAZIA tem altura zero; a de 1 estudante NÃO some", () => {
    /*
      ⚠️ O maior balde tem 20 e o menor tem 1 — de propósito: 1/20 é **5%**, que
      sem o piso de 8% vira uma barra invisível. "Ninguém nessa faixa" e "um,
      mas pouco" desenhariam igual, que é a distinção que o histograma existe
      para mostrar.

      Com `faixas` (maior = 4), 1/4 dá 25% e o piso nunca é acionado — a
      primeira versão deste teste usava esse fixture e a mutação que remove o
      `Math.max` sobrevivia.
    */
    const desbalanceadas = [
      { de: 0, ate: 11, quantos: 0 },
      { de: 12, ate: 22, quantos: 1 },
      { de: 23, ate: 34, quantos: 20 },
      { de: 35, ate: 45, quantos: 0 },
      { de: 46, ate: 56, quantos: 0 },
      { de: 57, ate: 67, quantos: 0 },
      { de: 68, ate: 79, quantos: 0 },
      { de: 80, ate: 90, quantos: 0 },
    ];
    const { container } = render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={dist({ base: 21 })}
        faixas={desbalanceadas}
      />,
    );

    const vazia = container.querySelector('[data-faixa="0-11"] span');
    const uma = container.querySelector('[data-faixa="12-22"] span');
    const cheia = container.querySelector('[data-faixa="23-34"] span');

    expect((vazia as HTMLElement).style.height).toBe("0px");
    // 1/20 = 5%, elevado ao piso de 8%
    expect((uma as HTMLElement).style.height).toBe("8%");
    expect((cheia as HTMLElement).style.height).toBe("100%");
  });
});

describe("HistogramaDaTurma — a dica de 300ms", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  const faixas = [
    { de: 0, ate: 11, quantos: 0 },
    { de: 12, ate: 22, quantos: 3 },
  ];

  const montar = () =>
    render(
      <ResumoDoRelatorio
        resumo={resumo()}
        distribuicao={{
          base: 3,
          mediana: 15,
          minimo: 12,
          maximo: 20,
          q1: 13,
          q3: 18,
        }}
        faixas={faixas}
      />,
    );

  it("⚠️ a faixa não usa mais o `title` nativo", () => {
    const { container } = montar();

    expect(
      container.querySelector('[data-faixa="12-22"]')?.closest("[title]"),
    ).toBeNull();
  });

  it("abre em 300ms com a contagem da faixa", () => {
    const { container } = montar();

    fireEvent.mouseEnter(
      container.querySelector('[data-faixa="12-22"]')!.parentElement!,
    );
    act(() => void vi.advanceTimersByTime(300));

    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "12 a 22 acertos: 3 estudante(s)",
    );
  });
});
