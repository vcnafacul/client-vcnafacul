import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QUESTOES_POR_PAGINA, TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const questao = (
  over: Partial<QuestaoDoRelatorio> = {},
): QuestaoDoRelatorio => ({
  numero: 5,
  questaoId: "q5",
  respondentes: 20,
  acertos: 12,
  erros: 6,
  semLeitura: 2,
  porAlternativa: { A: 12, B: 3, C: 2, D: 1, E: 0 },
  ...over,
});

/**
 * ⚠️ A célula é buscada pela COLUNA, não por texto solto na tela. Os números
 * desta tabela se repetem entre colunas por natureza — `acertos: 12` e
 * `A: 12` são o mesmo 12 — e um `getByText("12")` ou casa com dois nós ou
 * passa sem provar que o número caiu na coluna certa.
 */
const celula = (container: HTMLElement, colunaId: string) =>
  container.querySelector(`[data-column-id="${colunaId}"]`)!;

describe("TabelaDeQuestoes", () => {
  it("mostra número, acertos, erros e sem leitura", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "numero")).toHaveTextContent("5");
    expect(celula(container, "acertos")).toHaveTextContent("12");
    expect(celula(container, "erros")).toHaveTextContent("6");
    expect(celula(container, "semLeitura")).toHaveTextContent("2");
  });

  it("⚠️ questão sem número não some da lista", () => {
    // um simulado com questão sem número nunca é liberado, mas o código não
    // pode presumir: sumir seria pior que aparecer fora de ordem
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao({ numero: null })]} estado="idle" />,
    );

    expect(celula(container, "acertos")).toHaveTextContent("12");
    expect(celula(container, "numero")).toHaveTextContent("—");
  });

  it("⚠️ a distribuição aparece em COLUNA POR ALTERNATIVA, em percentual", () => {
    // A coluna agrupada com a contagem crua (`A 12 B 3 C 2...`) saiu: com ela
    // as 12 colunas somavam 1448px e estouravam a tela a partir de 1565px,
    // quando a sidebar entra no fluxo. Os números crus seguem em "Acertos",
    // "Erros" e "Sem leitura".
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(container.querySelector('[data-column-id="distribuicao"]')).toBeNull();
    expect(celula(container, "alternativaA").textContent).toBe("60%");
  });

  it("lista vazia mostra estado vazio, não tabela em branco", () => {
    render(<TabelaDeQuestoes questoes={[]} estado="idle" />);

    expect(screen.getByText(/nenhum/i)).toBeInTheDocument();
  });
});

describe("TabelaDeQuestoes — percentuais", () => {
  it("⚠️ % de acerto e de erro saem sobre RESPONDENTES", () => {
    // 12 acertos e 6 erros em 20 respondentes = 60% e 30%. Sobre
    // `acertos + erros` (18) daria 67% e 33% — números melhores, que
    // esconderiam do cálculo os 2 sem leitura.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "acertoPercentual").textContent).toBe("60%");
    expect(celula(container, "erroPercentual").textContent).toBe("30%");
  });

  it("⚠️ cada alternativa tem COLUNA PRÓPRIA", () => {
    // Agrupados, os percentuais viravam um bloco de texto que não dá para
    // comparar entre linhas nem ordenar. Separados, a coluna é lida de cima a
    // baixo — que é como se acha o distrator que pegou a turma.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "alternativaA").textContent).toBe("60%"); // 12/20
    expect(celula(container, "alternativaB").textContent).toBe("15%"); // 3/20
    expect(celula(container, "alternativaC").textContent).toBe("10%"); // 2/20
    expect(celula(container, "alternativaD").textContent).toBe("5%"); // 1/20
  });

  it("⚠️ os números crus continuam na tabela, em Acertos/Erros/Sem leitura", () => {
    // Remover a coluna agrupada não pode custar a contagem: é ela que deixa
    // conferir com a turma pequena, onde "3 de 5" diz mais que "60%".
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "acertos").textContent).toBe("12");
    expect(celula(container, "erros").textContent).toBe("6");
    expect(celula(container, "semLeitura").textContent).toBe("2");
  });

  it("⚠️ alternativa sem marcação mostra 0%, e não travessão", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "alternativaE").textContent).toBe("0%");
  });

  it("⚠️ ordenar por uma alternativa usa o NÚMERO, não o texto", () => {
    // É o ganho de separar em colunas: dá para achar o distrator que pegou a
    // turma ordenando por ele. Com a string formatada, "9%" viria depois de
    // "80%".
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          questao({
            questaoId: "a",
            numero: 1,
            respondentes: 100,
            porAlternativa: { B: 80 },
          }),
          questao({
            questaoId: "b",
            numero: 2,
            respondentes: 100,
            porAlternativa: { B: 9 },
          }),
        ]}
        estado="idle"
      />,
    );

    fireEvent.click(container.querySelector('[data-sort-id="alternativaB"]')!);
    const celulas = container.querySelectorAll(
      '[data-column-id="alternativaB"]',
    );

    expect(celulas[0].textContent).toBe("9%");
    expect(celulas[1].textContent).toBe("80%");
  });

  it("⚠️ questão sem respondentes mostra travessão, e não 0%", () => {
    // "0% de acerto" afirma que ninguém acertou; sem respondentes não há o que
    // dividir, que é outra coisa.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          questao({ respondentes: 0, acertos: 0, erros: 0, semLeitura: 0 }),
        ]}
        estado="idle"
      />,
    );

    expect(celula(container, "acertoPercentual").textContent).toBe("—");
    expect(celula(container, "erroPercentual").textContent).toBe("—");
  });

  it("⚠️ ordenar por % usa o NÚMERO, não o texto", () => {
    // Com `sortValue` devolvendo a string formatada, "9%" viria depois de
    // "80%" na ordenação alfabética.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          questao({ questaoId: "a", numero: 1, respondentes: 100, acertos: 80, erros: 20, semLeitura: 0 }),
          questao({ questaoId: "b", numero: 2, respondentes: 100, acertos: 9, erros: 91, semLeitura: 0 }),
        ]}
        estado="idle"
      />,
    );

    fireEvent.click(container.querySelector('[data-sort-id="acertoPercentual"]')!);
    const celulas = container.querySelectorAll(
      '[data-column-id="acertoPercentual"]',
    );

    expect(celulas[0].textContent).toBe("9%");
    expect(celulas[1].textContent).toBe("80%");
  });
});

describe("TabelaDeQuestoes — paginação", () => {
  const muitas = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      questao({ questaoId: `q${i}`, numero: i + 1 }),
    );

  it("⚠️ pagina em 25, como as outras telas do dashV2", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={muitas(30)} estado="idle" />,
    );

    expect(
      container.querySelectorAll('[data-column-id="numero"]'),
    ).toHaveLength(QUESTOES_POR_PAGINA);
  });

  it("o rodapé diz o intervalo e o total", () => {
    render(<TabelaDeQuestoes questoes={muitas(30)} estado="idle" />);

    expect(screen.getByText(/Mostrando 1.*25.*de 30/)).toBeInTheDocument();
  });

  it("⚠️ lista curta não mostra paginação nenhuma", () => {
    // O `DashListFooter` já devolve `null` com uma página só; o teste trava
    // isso para o rodapé não virar ruído numa tabela de 3 linhas.
    render(<TabelaDeQuestoes questoes={muitas(3)} estado="idle" />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("navegar para a segunda página troca as linhas", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={muitas(30)} estado="idle" />,
    );

    /*
      ⚠️ Busca DENTRO do rodapé. `getByText("2")` solto casa também com a
      questão de número 2 na tabela — os números da paginação e os da coluna
      "Questão" vivem na mesma tela por natureza.

      E é `getByText`, não `getByRole("link")`, como o próprio
      `DashListFooter.test.tsx` faz: o `PaginationLink` do
      `components/ui/pagination` não expõe role de link.
    */
    const rodape = screen.getByTestId("dash-list-footer");
    fireEvent.click(within(rodape).getByText("2"));

    expect(
      container.querySelectorAll('[data-column-id="numero"]'),
    ).toHaveLength(5);
  });
});
