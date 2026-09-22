import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertaDeLeitura } from "./AlertaDeLeitura";
import { faixaDePercentuais, listaDeNumeros } from "./textoDoAlerta";

const questao = (
  numero: number | null,
  semLeitura: number,
  respondentes = 20,
): QuestaoDoRelatorio => ({
  numero,
  questaoId: `q${numero}`,
  respondentes,
  acertos: respondentes - semLeitura,
  erros: 0,
  semLeitura,
  porAlternativa: { A: respondentes - semLeitura, B: 0, C: 0, D: 0, E: 0 },
  alternativaCorreta: "A",
  discriminacao: 0.4,
});

const linha = (nome: string): LinhaDoRelatorio => ({
  usuario: nome,
  nome,
  matricula: `m-${nome}`,
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  questoesRespondidas: 63,
});

const VAZIO_QUESTOES = { questoes: [], mediana: null };
const VAZIO_CARTOES = { cartoes: [], mediana: null };

describe("AlertaDeLeitura", () => {
  it("⚠️ nada a dizer é NADA — não uma faixa verde de 'leitura OK'", () => {
    // Aviso que aparece sempre deixa de ser aviso.
    const { container } = render(
      <AlertaDeLeitura
        questoes={VAZIO_QUESTOES}
        cartoes={VAZIO_CARTOES}
        aoAbrirCartao={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("lista as questões pelo número, com a faixa de percentuais e a mediana", () => {
    render(
      <AlertaDeLeitura
        questoes={{
          questoes: [questao(34, 8), questao(51, 16)],
          mediana: 2,
        }}
        cartoes={VAZIO_CARTOES}
        aoAbrirCartao={vi.fn()}
      />,
    );

    const faixa = screen.getByTestId("alerta-leitura-questoes");
    expect(faixa.textContent).toContain("2 questões");
    expect(faixa.textContent).toContain("34 e 51");
    // 8/20 = 40%, 16/20 = 80%
    expect(faixa.textContent).toContain("entre 40% e 80%");
    expect(faixa.textContent).toContain("2% no resto do simulado");
  });

  it("uma só questão fica no singular", () => {
    render(
      <AlertaDeLeitura
        questoes={{ questoes: [questao(34, 8)], mediana: 0 }}
        cartoes={VAZIO_CARTOES}
        aoAbrirCartao={vi.fn()}
      />,
    );

    expect(screen.getByTestId("alerta-leitura-questoes").textContent).toContain(
      "1 questão com leitura anormal",
    );
  });

  it("⚠️ o nome do cartão é um BOTÃO, e ele leva ao modal do reenvio", () => {
    /*
      O card é explícito: um cartão com leitura ruim que não falhou nunca entra
      na fila de trabalho do coordenador — o status dele é "Lido". Um alerta que
      só informa o deixaria exatamente onde estava.
    */
    const aoAbrirCartao = vi.fn();
    const maria = linha("Maria");
    render(
      <AlertaDeLeitura
        questoes={VAZIO_QUESTOES}
        cartoes={{ cartoes: [{ linha: maria, percentual: 30 }], mediana: 0 }}
        aoAbrirCartao={aoAbrirCartao}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Maria" }));

    expect(aoAbrirCartao).toHaveBeenCalledWith(maria);
  });

  it("mostra o percentual de cada cartão ao lado do nome", () => {
    render(
      <AlertaDeLeitura
        questoes={VAZIO_QUESTOES}
        cartoes={{
          cartoes: [
            { linha: linha("Maria"), percentual: 30 },
            { linha: linha("João"), percentual: 22 },
          ],
          mediana: 1,
        }}
        aoAbrirCartao={vi.fn()}
      />,
    );

    const faixa = screen.getByTestId("alerta-leitura-cartoes");
    expect(faixa.textContent).toContain("2 cartões");
    expect(faixa.textContent).toContain("Maria");
    expect(faixa.textContent).toContain("30% sem leitura");
    expect(faixa.textContent).toContain("22%");
  });

  it("as duas faixas aparecem juntas quando há os dois problemas", () => {
    render(
      <AlertaDeLeitura
        questoes={{ questoes: [questao(34, 8)], mediana: 0 }}
        cartoes={{ cartoes: [{ linha: linha("Maria"), percentual: 30 }], mediana: 0 }}
        aoAbrirCartao={vi.fn()}
      />,
    );

    expect(screen.getByTestId("alerta-leitura-questoes")).toBeTruthy();
    expect(screen.getByTestId("alerta-leitura-cartoes")).toBeTruthy();
  });

  it("⚠️ não é print:hidden — a ressalva importa mais no papel", () => {
    // Quem lê a folha não tem como conferir a base em lugar nenhum.
    render(
      <AlertaDeLeitura
        questoes={{ questoes: [questao(34, 8)], mediana: 0 }}
        cartoes={VAZIO_CARTOES}
        aoAbrirCartao={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("alertas-de-leitura").className,
    ).not.toContain("print:hidden");
  });
});

describe("textoDoAlerta", () => {
  it("faixa com um valor só não vira intervalo", () => {
    expect(faixaDePercentuais([40])).toBe("40%");
  });

  it("⚠️ a faixa mostra o PIOR, não só o menor", () => {
    // "mais de 35%" com uma questão em 80% esconde o caso que manda reimprimir.
    expect(faixaDePercentuais([35, 80, 42])).toBe("entre 35% e 80%");
  });

  it("lista com vírgulas e 'e' no fim", () => {
    expect(listaDeNumeros([34, 51, 52])).toBe("34, 51 e 52");
  });

  it("um número só não ganha conectivo", () => {
    expect(listaDeNumeros([34])).toBe("34");
  });

  it("⚠️ questão sem número vira travessão, e não some", () => {
    // A contagem no começo da frase tem de bater com o que vem nos parênteses.
    expect(listaDeNumeros([34, null])).toBe("34 e —");
  });
});
