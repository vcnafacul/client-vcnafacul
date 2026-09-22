import { fireEvent, render, screen, within } from "@testing-library/react";

const exportAnalyticsCsv = vi.hoisted(() => vi.fn());
vi.mock("@/utils/exportAnalyticsCsv", () => ({ exportAnalyticsCsv }));
import { describe, expect, it } from "vitest";
import { QUESTOES_POR_PAGINA, TabelaDeQuestoes } from "./TabelaDeQuestoes";
import { vi, beforeEach } from "vitest";
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
  // ⚠️ Coerente com `acertos: 12` e `porAlternativa.A: 12` — a invariante
  // `porAlternativa[correta] === acertos` vale nos dados de teste também,
  // senão os testes de destaque afirmariam algo que a api nunca produz.
  alternativaCorreta: "A",
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
  it("mostra número, base, gabarito e sem leitura", () => {
    // ⚠️ `Acertos` e `Erros` saíram no card 04 (duplicata e derivada);
    // `Respondentes` entrou, porque era o único número que só existia no CSV.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "numero")).toHaveTextContent("5");
    expect(celula(container, "respondentes")).toHaveTextContent("20");
    expect(celula(container, "gabarito")).toHaveTextContent("A");
    expect(celula(container, "semLeitura")).toHaveTextContent("2");
  });

  it("⚠️ questão sem número não some da lista", () => {
    // um simulado com questão sem número nunca é liberado, mas o código não
    // pode presumir: sumir seria pior que aparecer fora de ordem
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao({ numero: null })]} estado="idle" />,
    );

    expect(celula(container, "respondentes")).toHaveTextContent("20");
    expect(celula(container, "numero")).toHaveTextContent("—");
  });

  it("⚠️ a distribuição aparece em COLUNA POR ALTERNATIVA, em percentual", () => {
    // A coluna agrupada com a contagem crua (`A 12 B 3 C 2...`) saiu: com ela
    // as 12 colunas somavam 1448px e estouravam a tela a partir de 1565px,
    // quando a sidebar entra no fluxo. A base crua segue em "Respondentes".
    //
    // ⚠️ Assere numa alternativa que NÃO é o gabarito, para a igualdade exata
    // continuar exata — a do gabarito leva o ✓ do card 04.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(container.querySelector('[data-column-id="distribuicao"]')).toBeNull();
    expect(celula(container, "alternativaB").textContent).toBe("15%");
  });

  it("lista vazia mostra estado vazio, não tabela em branco", () => {
    render(<TabelaDeQuestoes questoes={[]} estado="idle" />);

    expect(screen.getByText(/nenhum/i)).toBeInTheDocument();
  });
});

describe("TabelaDeQuestoes — percentuais", () => {
  it("⚠️ % de acerto sai sobre RESPONDENTES", () => {
    // 12 acertos em 20 respondentes = 60%. Sobre `acertos + erros` (18) daria
    // 67% — número melhor, que esconderia do cálculo os 2 sem leitura.
    //
    // ⚠️ `% de erro` saiu da tabela no card 04 (é `100 − acerto − semLeitura`),
    // mas `percentualDeErro` continua exercitado pelo CSV — ver `exportar.test.ts`.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "acertoPercentual").textContent).toBe("60%");
    expect(celula(container, "semLeitura").textContent).toBe("2");
  });

  it("⚠️ cada alternativa tem COLUNA PRÓPRIA", () => {
    // Agrupados, os percentuais viravam um bloco de texto que não dá para
    // comparar entre linhas nem ordenar. Separados, a coluna é lida de cima a
    // baixo — que é como se acha o distrator que pegou a turma.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    // ⚠️ A é o gabarito do fixture, então a célula dela leva o ✓ do card 04 —
    // `toHaveTextContent` em vez de igualdade exata só nela.
    expect(celula(container, "alternativaA")).toHaveTextContent("60%"); // 12/20
    expect(celula(container, "alternativaB").textContent).toBe("15%"); // 3/20
    expect(celula(container, "alternativaC").textContent).toBe("10%"); // 2/20
    expect(celula(container, "alternativaD").textContent).toBe("5%"); // 1/20
  });

  it("⚠️ a BASE continua na tabela — é ela que deixa conferir turma pequena", () => {
    // Onde "3 de 5" diz mais que "60%". No card 04 quem carrega isso é
    // `Respondentes` + `Sem leitura`: `acertos` se reconstrói de
    // `% de acerto × respondentes`, e era por isso que a coluna dele era
    // dispensável — mas só depois que a base entrou.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "respondentes").textContent).toBe("20");
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
    // ⚠️ E a base mostra 0, que é diferente: zero respondente é um fato
    // medido; o percentual é que não existe.
    expect(celula(container, "respondentes").textContent).toBe("0");
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

describe("TabelaDeQuestoes — exportar CSV", () => {
  beforeEach(() => vi.clearAllMocks());

  const muitas = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      questao({ questaoId: `q${i}`, numero: i + 1 }),
    );

  it("⚠️ exporta TODAS as questões, não só a página aberta", () => {
    // Paginação é de leitura na tela, não de escopo: exportar 25 de 30 daria
    // uma planilha incompleta sem aviso nenhum. Com 30 questões a lista tem
    // duas páginas — é o que faz este teste discriminar.
    render(
      <TabelaDeQuestoes
        questoes={muitas(30)}
        estado="idle"
        nomeArquivo="questoes-x"
      />,
    );

    fireEvent.click(screen.getByTestId("exportar-csv"));

    expect(exportAnalyticsCsv.mock.calls[0][1]).toHaveLength(30);
  });

  it("⚠️ sem `nomeArquivo` o botão nem aparece", () => {
    // É o que mantém válidos os testes que só exercitam a tabela.
    render(<TabelaDeQuestoes questoes={muitas(3)} estado="idle" />);

    expect(screen.queryByTestId("exportar-csv")).not.toBeInTheDocument();
  });
});

describe("TabelaDeQuestoes — gabarito e colunas enxutas (card 04)", () => {
  /**
   * O card 04: a tabela tinha onze colunas e o conteúdo informativo de umas
   * cinco. `% de acerto` **é** a coluna da alternativa correta (mesmo número,
   * mesmo denominador), e `Erros`/`% de erro` são derivadas por aritmética de
   * primeiro grau. Elas custaram uma coluna útil: o docblock registra que a
   * tabela já estourava a largura a 1565px.
   */
  const comGabarito = (over: Partial<QuestaoDoRelatorio> = {}) =>
    questao({ alternativaCorreta: "A", ...over });

  it("⚠️ `Respondentes` entra — o denominador de todo percentual, na tela", () => {
    // Estava só no CSV. Quem olhava a tela não podia julgar a base de nenhum
    // número — o oposto do que o `indiceDeDificuldade` faz no modal.
    const { container } = render(
      <TabelaDeQuestoes questoes={[comGabarito()]} estado="idle" />,
    );

    expect(celula(container, "respondentes")).toHaveTextContent("20");
  });

  it("a coluna `Gabarito` mostra a alternativa correta", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: "C" })]}
        estado="idle"
      />,
    );

    expect(celula(container, "gabarito")).toHaveTextContent("C");
  });

  it("⚠️ gabarito `null` mostra travessão, e não uma letra qualquer", () => {
    // `null` é o que o ms manda quando os históricos do recorte DISCORDAM do
    // gabarito (card 03). Chutar a mais marcada inverteria a conclusão.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: null })]}
        estado="idle"
      />,
    );

    expect(celula(container, "gabarito")).toHaveTextContent("—");
  });

  /**
   * ⚠️ **O destaque é por CÉLULA, e o card pedia no cabeçalho.**
   *
   * O card propõe `<th>` com `C ✓ (%)`. Não dá: o cabeçalho é UM para a tabela
   * inteira e o gabarito é POR QUESTÃO — um `<th>` marcado afirmaria que C é a
   * correta de todas as linhas, que é falso na segunda questão da lista. O
   * destaque tem de viver onde o dado vive.
   *
   * O requisito real do card sobrevive inteiro: o marcador é **textual** (✓),
   * não só cor, porque `green3` mede 3.77:1 e não passa para texto pequeno
   * (ver `tokens.ts`) — e "qual é a correta" é justamente a informação que
   * torna as cinco colunas legíveis.
   */
  it("⚠️ a correta é marcada por TEXTO na célula, não só por cor", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: "C" })]}
        estado="idle"
      />,
    );

    expect(celula(container, "alternativaC")).toHaveTextContent("✓");
    expect(celula(container, "alternativaA")).not.toHaveTextContent("✓");
  });

  it("⚠️ o cabeçalho NÃO é marcado — o gabarito varia por linha", () => {
    // Duas questões com gabaritos diferentes na mesma tabela. Qualquer marca no
    // `<th>` mentiria para uma delas.
    render(
      <TabelaDeQuestoes
        questoes={[
          comGabarito({ questaoId: "q1", numero: 1, alternativaCorreta: "A" }),
          comGabarito({ questaoId: "q2", numero: 2, alternativaCorreta: "C" }),
        ]}
        estado="idle"
      />,
    );

    for (const alt of ["A", "B", "C", "D", "E"]) {
      expect(screen.getByText(`${alt} (%)`)).toBeInTheDocument();
    }
  });

  it("⚠️ cada linha marca o SEU gabarito, não o da primeira", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          comGabarito({ questaoId: "q1", numero: 1, alternativaCorreta: "A" }),
          comGabarito({ questaoId: "q2", numero: 2, alternativaCorreta: "C" }),
        ]}
        estado="idle"
      />,
    );

    const linhas = container.querySelectorAll("[data-row-key]");
    expect(
      linhas[0].querySelector('[data-column-id="alternativaA"]'),
    ).toHaveTextContent("✓");
    expect(
      linhas[1].querySelector('[data-column-id="alternativaC"]'),
    ).toHaveTextContent("✓");
    expect(
      linhas[1].querySelector('[data-column-id="alternativaA"]'),
    ).not.toHaveTextContent("✓");
  });

  it("⚠️ gabarito `null` não marca célula nenhuma", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: null })]}
        estado="idle"
      />,
    );

    for (const alt of ["A", "B", "C", "D", "E"]) {
      expect(celula(container, `alternativa${alt}`)).not.toHaveTextContent("✓");
    }
  });

  it("a célula da correta também tem peso de fonte — reforço, não a única pista", () => {
    // ⚠️ O peso vive num `<span>` DENTRO da célula, e não na célula: acrescentar
    // um `cellClassName` ao `DashColumn` mudaria o componente compartilhado por
    // uma necessidade de uma tela só — o docblock do dashV2 pede que só entre
    // ali o que duas telas usam.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: "C" })]}
        estado="idle"
      />,
    );

    expect(
      celula(container, "alternativaC").querySelector(".font-semibold"),
    ).not.toBeNull();
    expect(
      celula(container, "alternativaA").querySelector(".font-semibold"),
    ).toBeNull();
  });

  it.each(["acertos", "erros", "erroPercentual"])(
    "⚠️ a coluna `%s` saiu da tabela",
    (colunaId) => {
      // Duplicata e derivadas: `% de acerto` é a coluna do gabarito, e
      // `% de erro`/`Erros` se obtêm das outras por subtração. Exibir os três
      // como se cada um trouxesse informação nova é o que custou a largura.
      const { container } = render(
        <TabelaDeQuestoes questoes={[comGabarito()]} estado="idle" />,
      );

      expect(celula(container, colunaId)).toBeNull();
    },
  );

  it("⚠️ nenhuma coluna removida deixou a invariante sem como ser conferida", () => {
    // `respondentes` não é reconstruível de nada depois que `Acertos` e
    // `Erros` saem — é por isso que ele entra na mesma mudança que os remove.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          comGabarito({ respondentes: 20, acertos: 12, semLeitura: 2 }),
        ]}
        estado="idle"
      />,
    );

    // 12 de 20 = 60%; com a base na tela, os acertos se reconstroem de cabeça
    expect(celula(container, "respondentes")).toHaveTextContent("20");
    expect(celula(container, "acertoPercentual")).toHaveTextContent("60%");
    expect(celula(container, "semLeitura")).toHaveTextContent("2");
  });
});
