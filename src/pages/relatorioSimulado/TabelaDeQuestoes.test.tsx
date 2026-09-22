import { act, fireEvent, render, screen, within } from "@testing-library/react";

const exportAnalyticsCsv = vi.hoisted(() => vi.fn());
vi.mock("@/utils/exportAnalyticsCsv", () => ({ exportAnalyticsCsv }));
import { describe, expect, it } from "vitest";
import { QUESTOES_POR_PAGINA, TabelaDeQuestoes } from "./TabelaDeQuestoes";
import { vi, beforeEach, afterEach } from "vitest";
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
  // ⚠️ Positiva e acima de 0,20: o fixture base é uma questão SEM sinal, para
  // os testes de triagem partirem de zero e afirmarem o que acrescentam.
  discriminacao: 0.4,
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

  it("⚠️ a distribuição é UMA coluna de barra, não cinco de percentual", () => {
    // Card 19: as cinco colunas `A (%)`…`E (%)` viraram a coluna
    // `Distribuição`. Contradiz o docblock que as separou — e a razão está no
    // `BarraDeDistribuicao`: forma compara melhor que dígito, que era o
    // objetivo declarado daquele docblock.
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    expect(celula(container, "distribuicao")).not.toBeNull();
    for (const alt of ["A", "B", "C", "D", "E"]) {
      expect(
        container.querySelector(`[data-column-id="alternativa${alt}"]`),
      ).toBeNull();
    }
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

  it("⚠️ a barra carrega a distribuição, com as contagens no `title`", () => {
    // Substituiu as cinco colunas de percentual. O número não desapareceu: ele
    // está no `title` e no CSV — o que mudou é que a tela passou a mostrar
    // FORMA, que é o que se compara entre linhas.
    render(<TabelaDeQuestoes questoes={[questao()]} estado="idle" />);

    /*
      ⚠️ A contagem saiu do `title` para a `DicaRapida` (300ms, num portal). O
      `aria-label` do `role="img"` continua com o texto inteiro — quem usa
      leitor de tela não passa o mouse.
    */
    const rotulo = screen.getByRole("img").getAttribute("aria-label")!;
    expect(rotulo).toContain("A: 12");
    expect(rotulo).toContain("B: 3");
    expect(rotulo).toContain("sem leitura: 2");
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

  /**
   * ⚠️ Os testes de "alternativa sem marcação mostra 0%" e "ordenar por uma
   * alternativa usa o número" saíram com as colunas que eles descreviam
   * (card 19). O primeiro virou asserção da soma dos segmentos em
   * `BarraDeDistribuicao.test.tsx`; o segundo descreve uma capacidade que o
   * card removeu de propósito — ordenar por "% que marcou D" não é pergunta
   * que alguém faça, e a coluna `Distribuição` não tem `sortValue`.
   */
  it("⚠️ a coluna `Distribuição` NÃO é ordenável, e isso é deliberado", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[questao()]} estado="idle" />,
    );

    // Sem `sortValue`, o `DashTable` não emite botão nem `aria-sort` no `<th>`.
    const th = container.querySelector('[data-sort-id="distribuicao"]');
    expect(th).toBeNull();
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
  /**
   * ⚠️ **O destaque nas cinco colunas saiu com elas** (card 19). O requisito do
   * card 04 sobrevive inteiro, movido para a barra: o gabarito é marcado por
   * BORDA e leva a LETRA ao lado — ver `BarraDeDistribuicao.test.tsx`. A coluna
   * `Gabarito`, que o card 04 criou, segue sendo a via textual redundante.
   */
  it("⚠️ o gabarito é marcado na barra, por borda e letra", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: "C" })]}
        estado="idle"
      />,
    );

    expect(container.querySelector("[data-gabarito]")).not.toBeNull();
    expect(screen.getByText("C ✓")).toBeInTheDocument();
  });

  it("⚠️ cada linha marca o SEU gabarito, não o da primeira", () => {
    render(
      <TabelaDeQuestoes
        questoes={[
          comGabarito({ questaoId: "q1", numero: 1, alternativaCorreta: "A" }),
          comGabarito({ questaoId: "q2", numero: 2, alternativaCorreta: "C" }),
        ]}
        estado="idle"
      />,
    );

    expect(screen.getByText("A ✓")).toBeInTheDocument();
    expect(screen.getByText("C ✓")).toBeInTheDocument();
  });

  it("⚠️ gabarito `null` não marca segmento nenhum", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[comGabarito({ alternativaCorreta: null })]}
        estado="idle"
      />,
    );

    expect(container.querySelector("[data-gabarito]")).toBeNull();
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

describe("TabelaDeQuestoes — triagem (card 06)", () => {
  /*
    ⚠️ `shouldAdvanceTime` porque a dica abre por `setTimeout` de 300ms — sem
    ele, `waitFor` e afins ficariam presos, que é a armadilha registrada no
    `useBuscaDeEstudantes`.
  */
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  /**
   * O card 06: um simulado tem de 45 a 180 questões, e a aba entregava uma
   * linha para cada com dez números de peso visual igual e nenhuma indicação de
   * por onde começar. A triagem é o que transforma os cards 03 e 05 em produto.
   */
  const boa = (over: Partial<QuestaoDoRelatorio> = {}) =>
    questao({
      respondentes: 20,
      acertos: 10,
      erros: 10,
      semLeitura: 0,
      porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 },
      alternativaCorreta: "A",
      discriminacao: 0.4,
      ...over,
    });

  /** Gabarito suspeito + muito difícil + distrator morto, acumulados. */
  const ruim = (over: Partial<QuestaoDoRelatorio> = {}) =>
    boa({
      acertos: 3,
      erros: 17,
      discriminacao: -0.3,
      porAlternativa: { A: 3, B: 16, C: 1, D: 0, E: 0 },
      ...over,
    });

  it("a coluna `Sinais` mostra os badges, com rótulo textual", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[ruim()]} estado="idle" />,
    );

    const celulaSinais = celula(container, "sinais");
    expect(celulaSinais).toHaveTextContent("Gabarito?");
    expect(celulaSinais).toHaveTextContent("Difícil");
  });

  it("⚠️ questão sem sinal mostra travessão, e não célula vazia", () => {
    // Vazio se lê como "não calculou".
    const { container } = render(
      <TabelaDeQuestoes questoes={[boa()]} estado="idle" />,
    );

    expect(celula(container, "sinais")).toHaveTextContent("—");
  });

  it("⚠️ o valor da discriminação vai no `title`, não em coluna própria", () => {
    // Decisão do card 19: o coordenador quer saber se a questão presta, não que
    // o ponto-bisserial é −0,30. Mas quem quiser conferir tem o número.
    const { container } = render(
      <TabelaDeQuestoes questoes={[ruim()]} estado="idle" />,
    );

    /*
      ⚠️ A dica só EXISTE depois do hover + 300ms, e num portal no `body` — foi
      o conserto do corte: o `span.block.truncate` que o `DashTable` põe em toda
      célula tem `overflow: hidden`, e cortava uma caixa `absolute`.

      ⚠️ Vírgula: o número sai em pt-BR. "-0.30" é como o JS formata.
    */
    fireEvent.mouseEnter(
      container.querySelector('[data-dica="gabarito_suspeito"]')!,
    );
    act(() => void vi.advanceTimersByTime(300));

    expect(screen.getByRole("tooltip")).toHaveTextContent("-0,30");
    expect(container.querySelector('[data-column-id="discriminacao"]')).toBeNull();
  });

  it("⚠️ o badge NÃO tem `title` — a dica de 300ms substituiu o nativo", () => {
    /*
      Os dois juntos dariam DUAS caixas de texto sobre o mesmo badge, dizendo a
      mesma coisa — uma em 300ms e a outra no ~1s do navegador.

      ⚠️ Este teste vive aqui, e não no `DicaDoSinal.test.tsx`: lá o componente
      é montado isolado e nunca teria `title` de qualquer jeito. A duplicação só
      pode nascer em quem USA a dica, que é o `SinaisDaQuestao`.
    */
    const { container } = render(
      <TabelaDeQuestoes questoes={[ruim()]} estado="idle" />,
    );

    const celulaSinais = celula(container, "sinais");
    expect(celulaSinais.querySelector("[title]")).toBeNull();

    // e a explicação continua alcançável — no portal, depois do atraso
    fireEvent.mouseEnter(celulaSinais.querySelector("[data-dica]")!);
    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("⚠️ a coluna `Sinais` NÃO é ordenável — array não tem ordem natural", () => {
    const { container } = render(
      <TabelaDeQuestoes questoes={[ruim()]} estado="idle" />,
    );

    expect(container.querySelector('[data-sort-id="sinais"]')).toBeNull();
  });

  it("a barra de filtros entrou, e o botão de exportar mora dentro dela", () => {
    // ⚠️ O que o botão baixa depende do filtro ao lado — separados, a pessoa
    // exporta 180 linhas achando que exportou as 7 que está vendo.
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[boa()]}
        estado="idle"
        nomeArquivo="questoes"
      />,
    );

    const barra = container.querySelector('[data-testid="dash-filter-bar"]')!;
    expect(barra).not.toBeNull();
    expect(barra.querySelector('[data-testid="exportar-csv"]')).not.toBeNull();
  });

  it("⚠️ o contador do filtro conta a lista INTEIRA", () => {
    // Com o filtro ligado, a lista filtrada são só as com sinal — e o rótulo
    // diria "(1) de 1", que não informa nada. Mesma razão do
    // `quantosNaoEnviaram` na aba de Estudantes.
    render(
      <TabelaDeQuestoes
        questoes={[
          boa({ questaoId: "q1", numero: 1 }),
          boa({ questaoId: "q2", numero: 2 }),
          ruim({ questaoId: "q3", numero: 3 }),
        ]}
        estado="idle"
      />,
    );

    expect(screen.getByText(/Só questões com sinal \(1\)/)).toBeInTheDocument();
  });

  it("o filtro recorta a tabela para as questões com sinal", () => {
    const { container } = render(
      <TabelaDeQuestoes
        questoes={[
          boa({ questaoId: "q1", numero: 1 }),
          boa({ questaoId: "q2", numero: 2 }),
          ruim({ questaoId: "q3", numero: 3 }),
        ]}
        estado="idle"
      />,
    );

    expect(container.querySelectorAll("[data-row-key]")).toHaveLength(3);

    fireEvent.click(screen.getByTestId("toggle-so-com-sinal"));

    const linhas = container.querySelectorAll("[data-row-key]");
    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toHaveTextContent("3");
  });

  it("⚠️ o filtro volta para a página 1", () => {
    // 180 questões com 7 sinais cabem numa página; quem estava na página 4
    // veria a tabela vazia sem dizer por quê.
    const muitas = Array.from({ length: QUESTOES_POR_PAGINA + 5 }, (_, i) =>
      boa({ questaoId: `q${i}`, numero: i + 1 }),
    );
    // a única com sinal é a última, que está na página 2
    muitas[muitas.length - 1] = ruim({ questaoId: "qx", numero: 999 });

    const { container } = render(
      <TabelaDeQuestoes questoes={muitas} estado="idle" />,
    );

    // ⚠️ Dentro do rodapé: `getByText("2")` solto casa também com a questão de
    // número 2 na tabela — a armadilha que o teste de paginação acima registra.
    const rodape = screen.getByTestId("dash-list-footer");
    fireEvent.click(within(rodape).getByText("2"));
    expect(container.querySelectorAll("[data-row-key]")).toHaveLength(5);

    fireEvent.click(screen.getByTestId("toggle-so-com-sinal"));

    // uma linha só, e visível — não uma página 2 vazia
    expect(container.querySelectorAll("[data-row-key]")).toHaveLength(1);
    expect(container.querySelector("[data-row-key]")).toHaveTextContent("999");
  });

  it("⚠️ o CSV segue o FILTRO, mas não a paginação", () => {
    // Paginação é de leitura na tela; filtro é escopo. Quem ligou "só com
    // sinal" e clicou em exportar quer as com sinal — e é por isso que o botão
    // mora dentro da barra, ao lado do toggle.
    const muitas = Array.from({ length: QUESTOES_POR_PAGINA + 5 }, (_, i) =>
      boa({ questaoId: `q${i}`, numero: i + 1 }),
    );
    muitas[0] = ruim({ questaoId: "qx", numero: 1 });

    render(
      <TabelaDeQuestoes
        questoes={muitas}
        estado="idle"
        nomeArquivo="questoes"
      />,
    );

    // sem filtro: todas as 30, embora só 25 estejam na tela
    fireEvent.click(screen.getByTestId("exportar-csv"));
    expect(exportAnalyticsCsv.mock.calls[0][1]).toHaveLength(
      QUESTOES_POR_PAGINA + 5,
    );

    fireEvent.click(screen.getByTestId("toggle-so-com-sinal"));
    fireEvent.click(screen.getByTestId("exportar-csv"));
    expect(exportAnalyticsCsv.mock.calls[1][1]).toHaveLength(1);
  });

  it("nenhuma questão com sinal: o rótulo não mostra contador", () => {
    render(<TabelaDeQuestoes questoes={[boa()]} estado="idle" />);

    expect(screen.getByText("Só questões com sinal")).toBeInTheDocument();
  });
});
