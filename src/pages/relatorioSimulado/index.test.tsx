import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelatorioSimulado from "./index";

const buscarRelatorio = vi.hoisted(() => vi.fn());
const buscarQuestoes = vi.hoisted(() => vi.fn());
const buscarDetalheDoEstudante = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

/**
 * ⚠️ Só o `useNavigate` é trocado — `MemoryRouter`, `Routes` e `useLocation`
 * continuam os de verdade. Espionar a navegação por um `<Route>` de destino
 * não distinguiria `push` de `replace`, que é metade do que estes testes
 * precisam afirmar.
 */
vi.mock("react-router-dom", async (importOriginal) => {
  const real = await importOriginal<typeof import("react-router-dom")>();
  return { ...real, useNavigate: () => navigate };
});
vi.mock("@/services/relatorioSimulado/buscarRelatorio", () => ({
  buscarRelatorio,
  caminhoDoRelatorio: vi.fn(),
}));
vi.mock("@/services/relatorioSimulado/buscarQuestoes", () => ({ buscarQuestoes }));
const exportAnalyticsCsv = vi.hoisted(() => vi.fn());
vi.mock("@/utils/exportAnalyticsCsv", () => ({ exportAnalyticsCsv }));
vi.mock("@/services/relatorioSimulado/buscarDetalheDoEstudante", () => ({
  buscarDetalheDoEstudante,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const RESPOSTA = {
  linhas: [
    {
      usuario: "u1",
      nome: "Ana Silva",
      matricula: "2025001",
      turmaId: "t-1",
      turmaNome: "Turma A",
      enviouCartao: true,
      status: "completed",
      aproveitamentoGeral: 0.8,
      cartaoCode: "07",
    },
  ],
  resumo: {
    totalNoRecorte: 1,
    comLeituraConcluida: 1,
    aproveitamentoGeral: 0.8,
    totalEstudantesComCartaoNoCursinho: 1,
    temEstudanteSemTurma: false,
    linhasSemEstudanteAtivo: 0,
    totalDeQuestoes: 90,
  },
};

/**
 * ⚠️ `mouseDown`, não `click`, e sem `user-event`: o pacote não existe neste
 * repo (só `@testing-library/react`), e o `TabsTrigger` do Radix troca de aba
 * no `onMouseDown` — um `fireEvent.click` não dispara mousedown e a aba não
 * muda, o que faria o teste passar por não ter acontecido nada.
 */
const abrirAba = (nome: RegExp) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name: nome }));

type Entrada = string | { pathname: string; search?: string; state?: unknown };

const montar = (rota: Entrada = "/relatorio-simulado/sim-1") =>
  render(
    <MemoryRouter initialEntries={[rota as never]}>
      <Routes>
        <Route path="/relatorio-simulado/:simuladoId" element={<RelatorioSimulado />} />
      </Routes>
    </MemoryRouter>,
  );

describe("RelatorioSimulado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
    buscarQuestoes.mockResolvedValue({ questoes: [] });
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [],
    });
  });

  it("busca o relatório do simulado da URL", async () => {
    montar();

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", undefined),
    );
    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
  });

  it("?turma= restringe o recorte", async () => {
    montar("/relatorio-simulado/sim-1?turma=t-9");

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", "t-9"),
    );
  });

  it("⚠️ NÃO busca as questões junto — só na primeira abertura da aba", async () => {
    montar();

    await screen.findByText("Ana Silva");
    expect(buscarQuestoes).not.toHaveBeenCalled();

    abrirAba(/quest/i);

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
  });

  it("voltar para a aba de estudantes e de novo para questões não rebusca", async () => {
    montar();
    await screen.findByText("Ana Silva");

    abrirAba(/quest/i);
    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
    abrirAba(/estudante/i);
    abrirAba(/quest/i);

    expect(buscarQuestoes).toHaveBeenCalledTimes(1);
  });

  it("⚠️ ?turma= vazio é tratado como SEM turma, nos dois lugares", async () => {
    // `??` deixaria passar string vazia: o serviço pediria o cursinho inteiro
    // (o `?` dele é falsy para "") e a tela esconderia a coluna Turma (o
    // `!== undefined` dela é truthy) — recorte largo sem dizer de quem é.
    montar("/relatorio-simulado/sim-1?turma=");

    await waitFor(() =>
      expect(buscarRelatorio).toHaveBeenCalledWith("tok", "sim-1", undefined),
    );
    expect(
      await screen.findByRole("columnheader", { name: /turma/i }),
    ).toBeInTheDocument();
  });

  /**
   * ⚠️ `usuario` sozinho não é chave: a api não faz DISTINCT e não há índice
   * único em (user_id, partner_prep_course_id). Dois processos seletivos do
   * mesmo cursinho = duas linhas do mesmo usuário, e chave repetida faz o
   * React reconciliar linha na DOM errada depois de um sort.
   */
  it("⚠️ duas linhas do MESMO usuário, matrículas diferentes, ganham chaves distintas", async () => {
    const [linha] = RESPOSTA.linhas;
    buscarRelatorio.mockResolvedValue({
      ...RESPOSTA,
      linhas: [
        { ...linha, matricula: "2025001", nome: "Ana Silva" },
        { ...linha, matricula: "2024077", nome: "Ana Silva (2024)" },
      ],
    });

    const { container } = montar();
    await screen.findByText("Ana Silva");

    // ⚠️ Renderizar as duas não basta: o React desenha linha de chave repetida
    // do mesmo jeito (só reclama no console). O que este teste afirma é que as
    // CHAVES são distintas — é delas que depende a reconciliação pós-sort.
    const chaves = [...container.querySelectorAll("[data-row-key]")].map((el) =>
      el.getAttribute("data-row-key"),
    );

    expect(chaves).toHaveLength(2);
    expect(new Set(chaves).size).toBe(2);
    expect(screen.getByText("Ana Silva (2024)")).toBeInTheDocument();
  });

  it("⚠️ voltar num link aberto em aba nova cai na listagem — não em navigate(-1)", async () => {
    // sem histórico, `navigate(-1)` não faz nada e o botão fica inerte,
    // justamente no caso que fez esta tela ser rota e não modal
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(navigate).toHaveBeenCalledWith("/dashboard/cursinho-provas");
  });

  it("⚠️ voltar com estado de origem REPLACE, para o back do navegador não voltar ao relatório", async () => {
    const de = {
      caminho: "/dashboard/cursinho-provas",
      filtros: {
        nome: "enem",
        edicao: "",
        aplicacao: "",
        ano: "",
        gabaritoOnly: false,
      },
      provaId: "p-1",
      pagina: 3,
    };

    montar({ pathname: "/relatorio-simulado/sim-1", state: { de } });
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(navigate).toHaveBeenCalledWith("/dashboard/cursinho-provas", {
      replace: true,
      state: { de },
    });
  });

  it("voltar usa o caminho do state mesmo sem filtros — veio da tela de turma", async () => {
    // o EstadoDeVolta completo é da listagem de provas; quem vem da turma manda
    // só o caminho, e o voltar tem que honrá-lo em vez de cair no fallback
    const de = { caminho: "/dashboard/turmas/t-1" };

    montar({ pathname: "/relatorio-simulado/sim-1", state: { de } });
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(navigate).toHaveBeenCalledWith("/dashboard/turmas/t-1", {
      replace: true,
      state: { de },
    });
  });

  /**
   * ⚠️ O "tentar de novo" das questões passa pela MESMA guarda do carregamento
   * preguiçoso, sem escape hatch: chegar ao erro é chegar pelo `catch`, que
   * nunca chamou `setQuestoes` — então `questoes` ainda é `null` e a guarda
   * deixa passar. Se algum dia alguém puser erro e lista no mesmo estado, este
   * teste cai, e é o aviso de que a guarda precisa de mais do que `!== null`.
   */
  it("o erro das questões é recuperável — tentar de novo rebusca", async () => {
    buscarQuestoes.mockRejectedValueOnce(new Error("caiu"));

    montar();
    await screen.findByText("Ana Silva");
    abrirAba(/quest/i);

    /*
      ⚠️ Espera o BOTÃO de recuperação, não um texto `/erro/i` solto: desde que
      a tabela ganhou as colunas "Erros" e "% de erro", aquele seletor casa com
      dois cabeçalhos e falha por ambiguidade — sem que nada do comportamento
      testado tenha mudado.
    */
    const tentarDeNovo = await screen.findByRole("button", {
      name: /tentar novamente/i,
    });
    fireEvent.click(tentarDeNovo);

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(2));
  });

  it("erro na busca mostra estado de erro, não tela em branco", async () => {
    buscarRelatorio.mockRejectedValue(new Error("caiu"));

    montar();

    expect(await screen.findByText(/erro/i)).toBeInTheDocument();
  });

  /**
   * ⚠️ O erro só vale se der para sair dele. Um estado de erro sem volta é a
   * mesma tela em branco com outra roupa.
   */
  it("o erro é recuperável — tentar de novo rebusca e mostra as linhas", async () => {
    buscarRelatorio.mockRejectedValueOnce(new Error("caiu"));

    montar();
    await screen.findByText(/erro/i);

    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
    expect(buscarRelatorio).toHaveBeenCalledTimes(2);
  });

  it("clicar na linha de quem ENVIOU abre o detalhe daquele estudante", async () => {
    // o par do teste seguinte: sem este, "não abre nada" passaria numa tela
    // que nunca abre nada
    montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await waitFor(() =>
      expect(buscarDetalheDoEstudante).toHaveBeenCalledWith("tok", "sim-1", "u1"),
    );
  });

  it("⚠️ o historicoId da linha chega ao modal — é por ele que se reprocessa", async () => {
    // o detalhe é buscado por `usuario`, mas reprocessar é por HISTÓRICO. Sem
    // o id atravessando daqui, o modal de um cartão falho não oferece ação
    // nenhuma e a série inteira não serve para nada em tela.
    buscarRelatorio.mockResolvedValue({
      linhas: [{ ...RESPOSTA.linhas[0], historicoId: "h1", status: "failed" }],
      resumo: RESPOSTA.resumo,
    });
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "failed",
      falha: {
        codigo: "cartao_nao_detectado",
        descricao: "Não foi possível localizar o cartão na foto",
        acaoSugerida: "reenviar_foto",
      },
      respostas: [],
    });
    const { container } = montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await screen.findByText(/não foi possível localizar o cartão/i);
    expect(container.querySelector('input[type="file"]')).toBeTruthy();
  });

  it("⚠️ clicar numa linha de quem NÃO enviou não abre nada", async () => {
    buscarRelatorio.mockResolvedValue({
      linhas: [{ ...RESPOSTA.linhas[0], enviouCartao: false, status: undefined }],
      resumo: RESPOSTA.resumo,
    });
    montar();

    // ⚠️ Liga o toggle primeiro: quem não enviou fica ESCONDIDO por padrão,
    // então sem isto a linha nem existe no DOM e o teste passaria sem provar
    // nada sobre o clique.
    fireEvent.click(await screen.findByTestId("toggle-nao-enviaram"));
    fireEvent.click(await screen.findByText("Ana Silva"));

    expect(buscarDetalheDoEstudante).not.toHaveBeenCalled();
  });
});

describe("RelatorioSimulado — filtros da tabela", () => {
  const COM_DUAS = {
    linhas: [
      RESPOSTA.linhas[0],
      {
        ...RESPOSTA.linhas[0],
        usuario: "u9",
        nome: "Bruno Cardoso",
        matricula: "2025099",
        enviouCartao: false,
        status: undefined,
        aproveitamentoGeral: undefined,
      },
    ],
    resumo: RESPOSTA.resumo,
  };

  it("⚠️ por padrão a tabela esconde quem não enviou", async () => {
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Cardoso")).not.toBeInTheDocument();
  });

  it("⚠️ o rótulo do toggle diz QUANTOS estão escondidos", async () => {
    // É o que explica a diferença entre a tabela e o "Estudantes no recorte"
    // do resumo, que continua contando todo mundo.
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();

    expect(await screen.findByText(/Mostrar quem não enviou \(1\)/)).toBeInTheDocument();
  });

  it("ligar o toggle traz quem não enviou", async () => {
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();

    fireEvent.click(await screen.findByTestId("toggle-nao-enviaram"));

    expect(await screen.findByText("Bruno Cardoso")).toBeInTheDocument();
  });

  it("⚠️ o resumo NÃO muda com o filtro", async () => {
    // Os números do topo descrevem o recorte, não o que está visível. Se o
    // filtro mexesse neles, esconder linhas mudaria o denominador e a tela
    // passaria a dizer que 100% enviou.
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();

    // ⚠️ Ancorado no bloco COBERTURA (card 09), que substituiu os três números
    // soltos. O que o teste protege não mudou: o denominador do resumo é o
    // recorte, e esconder linhas não pode mexer nele — senão a tela passa a
    // dizer que 100% enviou.
    const cobertura = () =>
      screen.getByText("estudantes no cálculo da média").previousSibling
        ?.textContent;

    await screen.findByText("Ana Silva");
    const antes = cobertura();
    fireEvent.click(screen.getByTestId("toggle-nao-enviaram"));

    expect(cobertura()).toBe(antes);
  });

  it("a busca filtra por nome", async () => {
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByTestId("toggle-nao-enviaram"));
    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "bruno" },
    });

    await waitFor(() =>
      expect(screen.queryByText("Ana Silva")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Bruno Cardoso")).toBeInTheDocument();
  });

  it("a busca filtra por matrícula", async () => {
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "2025001" },
    });

    await waitFor(() => expect(screen.getByText("Ana Silva")).toBeInTheDocument());
  });

  it("⚠️ filtro que esconde tudo mostra vazio DIFERENTE do recorte vazio", async () => {
    // Dizer "nenhum estudante neste recorte" com a busca preenchida afirma
    // algo falso sobre os dados e manda procurar defeito onde não há.
    buscarRelatorio.mockResolvedValue(COM_DUAS);
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "zzzzz" },
    });

    expect(await screen.findByTestId("estudantes-vazio-filtro")).toBeInTheDocument();
    expect(screen.queryByTestId("estudantes-vazio")).not.toBeInTheDocument();
  });

  it("recorte realmente vazio continua com o vazio de sempre", async () => {
    buscarRelatorio.mockResolvedValue({ linhas: [], resumo: RESPOSTA.resumo });
    montar();

    expect(await screen.findByTestId("estudantes-vazio")).toBeInTheDocument();
  });
});

describe("RelatorioSimulado — paginação dos estudantes", () => {
  const muitos = (n: number) => ({
    linhas: Array.from({ length: n }, (_, i) => ({
      ...RESPOSTA.linhas[0],
      usuario: `u${i}`,
      nome: `Estudante ${i}`,
      matricula: `20250${i}`,
    })),
    resumo: RESPOSTA.resumo,
  });

  it("⚠️ pagina em 25, como as outras telas do dashV2", async () => {
    buscarRelatorio.mockResolvedValue(muitos(30));
    const { container } = montar();

    await screen.findByText("Estudante 0");
    expect(
      container.querySelectorAll('[data-column-id="estudante"]'),
    ).toHaveLength(25);
  });

  it("⚠️ o rodapé conta as linhas FILTRADAS, não o recorte inteiro", async () => {
    // Depois de uma busca, "Mostrando 1–25 de 30" seria mentira sobre o que
    // está na tabela. O número do recorte continua no resumo, acima.
    buscarRelatorio.mockResolvedValue(muitos(30));
    montar();
    await screen.findByText("Estudante 0");

    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "Estudante 1" },
    });

    // "Estudante 1", "Estudante 10".."Estudante 19" = 11
    await waitFor(() =>
      expect(screen.getByText(/Mostrando 1.*11.*de 11/)).toBeInTheDocument(),
    );
  });

  it("⚠️ filtrar volta para a página 1", async () => {
    // Buscar estando na página 2 mostraria a tabela vazia: o resultado existe,
    // mas está na página 1, e a tela não diria isso.
    //
    // ⚠️ O conjunto filtrado precisa ter MAIS de uma página (31 itens), senão
    // o teste não discrimina: com um resultado que cabe numa página só, o
    // rodapé fica idêntico com ou sem o reset — foi o que uma mutação pegou.
    buscarRelatorio.mockResolvedValue(muitos(120));
    montar();
    await screen.findByText(/Mostrando 1.*25.*de 120/);

    const rodape = screen.getByTestId("dash-list-footer");
    fireEvent.click(within(rodape).getByText("2"));
    await screen.findByText(/Mostrando 26.*50.*de 120/);

    // "Estudante 1", "Estudante 10".."Estudante 19", "Estudante 100".."119" = 31
    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "Estudante 1" },
    });

    // Sem o reset, mostraria "26–31 de 31".
    await waitFor(() =>
      expect(screen.getByText(/Mostrando 1.*25.*de 31/)).toBeInTheDocument(),
    );
  });
});

describe("RelatorioSimulado — acertos da turma no detalhe", () => {
  // ⚠️ `beforeEach` próprio: o do primeiro describe não alcança este, e sem o
  // mock de `buscarRelatorio` a tabela nem renderiza a linha que o teste clica.
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
  });

  const QUESTOES = {
    questoes: [
      {
        numero: 1,
        questaoId: "qa",
        respondentes: 20,
        acertos: 18,
        erros: 2,
        semLeitura: 0,
        porAlternativa: {},
      },
    ],
  };

  const RESPOSTAS = {
    status: "completed" as const,
    respostas: [
      {
        numero: 1,
        questaoId: "qa",
        alternativaEstudante: "A",
        alternativaCorreta: "A",
        resultado: "acerto" as const,
      },
    ],
  };

  it("⚠️ abrir o detalhe DISPARA a carga do agregado, sem passar pela aba", async () => {
    // Sem isto a coluna só teria número para quem tivesse visitado a aba
    // "Questões" antes — apareceria ou não, sem a pessoa entender por quê.
    buscarQuestoes.mockResolvedValue(QUESTOES);
    buscarDetalheDoEstudante.mockResolvedValue(RESPOSTAS);
    montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalled());
  });

  it("mostra o percentual COM a base", async () => {
    buscarQuestoes.mockResolvedValue(QUESTOES);
    buscarDetalheDoEstudante.mockResolvedValue(RESPOSTAS);
    const { container } = montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await waitFor(() =>
      expect(
        container.querySelector('[data-column-id="dificuldade"]')?.textContent,
      ).toBe("90% de 20"),
    );
  });

  it("⚠️ o detalhe e a aba COMPARTILHAM a mesma carga — não busca duas vezes", async () => {
    // As duas entradas chamam `carregarQuestoes`, e a guarda
    // `questoes !== null` dela é quem evita a segunda viagem. Sem a guarda,
    // abrir o detalhe e depois a aba custaria duas chamadas iguais.
    buscarQuestoes.mockResolvedValue(QUESTOES);
    buscarDetalheDoEstudante.mockResolvedValue(RESPOSTAS);
    montar();

    fireEvent.click(await screen.findByText("Ana Silva"));
    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));

    abrirAba(/quest/i);

    await waitFor(() => expect(buscarQuestoes).toHaveBeenCalledTimes(1));
  });

  it("⚠️ o agregado falhando NÃO quebra o detalhe — coluna vira travessão", async () => {
    // O percentual é acessório: o modal veio mostrar o que o estudante marcou,
    // e travar essa leitura por causa de um número de contexto seria pior.
    buscarQuestoes.mockRejectedValue(new Error("caiu"));
    buscarDetalheDoEstudante.mockResolvedValue(RESPOSTAS);
    const { container } = montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await waitFor(() =>
      expect(screen.getByText("Marcou")).toBeInTheDocument(),
    );
    expect(
      container.querySelector('[data-column-id="dificuldade"]')?.textContent,
    ).toBe("—");
  });

  it("⚠️ questão fora do agregado vira travessão, e não 0%", async () => {
    buscarQuestoes.mockResolvedValue({ questoes: [] });
    buscarDetalheDoEstudante.mockResolvedValue(RESPOSTAS);
    const { container } = montar();

    fireEvent.click(await screen.findByText("Ana Silva"));

    await waitFor(() =>
      expect(screen.getByText("Marcou")).toBeInTheDocument(),
    );
    expect(
      container.querySelector('[data-column-id="dificuldade"]')?.textContent,
    ).toBe("—");
  });
});

describe("RelatorioSimulado — exportar CSV", () => {
  const muitos = (n: number) => ({
    linhas: Array.from({ length: n }, (_, i) => ({
      ...RESPOSTA.linhas[0],
      usuario: `u${i}`,
      nome: `Estudante ${i}`,
      matricula: `20250${i}`,
    })),
    resumo: RESPOSTA.resumo,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
    buscarQuestoes.mockResolvedValue({ questoes: [] });
  });

  const linhasExportadas = () => exportAnalyticsCsv.mock.calls[0][1];

  it("exporta os estudantes com cabeçalho e nome de arquivo", async () => {
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByTestId("exportar-csv"));

    const [cabecalho, , nome] = exportAnalyticsCsv.mock.calls[0];
    expect(cabecalho).toContain("Estudante");
    expect(nome).toMatch(/^estudantes-sim-1-\d{4}-\d{2}-\d{2}$/);
  });

  it("⚠️ o CSV respeita o FILTRO — é o que está na tela", async () => {
    // Coerente com a impressão, que já sai filtrada. Quem quer tudo limpa o
    // filtro antes.
    buscarRelatorio.mockResolvedValue(muitos(30));
    montar();
    await screen.findByText("Estudante 0");

    fireEvent.change(screen.getByPlaceholderText(/nome ou matrícula/i), {
      target: { value: "Estudante 7" },
    });
    await waitFor(() =>
      expect(screen.queryByText("Estudante 0")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("exportar-csv"));

    expect(linhasExportadas()).toHaveLength(1);
  });

  it("⚠️ o CSV IGNORA a paginação — exporta o filtrado inteiro, não a página", async () => {
    // Paginação é de leitura na tela, não de escopo: exportar 25 de 30 daria
    // uma planilha incompleta sem aviso nenhum.
    buscarRelatorio.mockResolvedValue(muitos(30));
    montar();
    await screen.findByText("Estudante 0");

    fireEvent.click(screen.getByTestId("exportar-csv"));

    expect(linhasExportadas()).toHaveLength(30);
  });

  it("⚠️ a aba de questões tem o SEU botão, com o seu arquivo", async () => {
    buscarQuestoes.mockResolvedValue({
      questoes: [
        {
          numero: 1,
          questaoId: "q1",
          respondentes: 10,
          acertos: 5,
          erros: 5,
          semLeitura: 0,
          porAlternativa: {},
        },
      ],
    });
    montar();
    await screen.findByText("Ana Silva");
    abrirAba(/quest/i);
    // ⚠️ `Acertos` saiu da tabela no card 04 — `Respondentes` é o cabeçalho
    // que sinaliza que a aba de questões terminou de montar.
    await screen.findByText("Respondentes");

    // o botão da aba de questões é o único visível agora
    fireEvent.click(screen.getByTestId("exportar-csv"));

    const [cabecalho, , nome] = exportAnalyticsCsv.mock.calls[0];
    expect(cabecalho).toContain("Respondentes");
    expect(nome).toMatch(/^questoes-sim-1-/);
  });
});

describe("RelatorioSimulado — alinhamento horizontal", () => {
  /*
    ⚠️ jsdom não calcula layout: o que dá para afirmar aqui é que as classes de
    recuo estão nos blocos certos. O resultado visual — tudo alinhado no mesmo
    eixo — é gate manual, registrado no PR. Mesma postura do `impressao.test`.
  */
  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA);
    buscarQuestoes.mockResolvedValue({ questoes: [] });
  });

  it("⚠️ o resumo tem recuo PRÓPRIO, não herdado do container", async () => {
    // O container não pode dar `px`: a `DashFilterBar` e a `DashTable` já
    // trazem o seu, e os dois somariam — o resumo a 16px da borda e a faixa
    // de filtros a 32px, desalinhados na mesma tela.
    const { container } = montar();
    await screen.findByText("Ana Silva");

    // ⚠️ Ancorado no rótulo do bloco `Cobertura` (card 09).
    const resumo = screen
      .getByText("estudantes no cálculo da média")
      .closest("section");
    expect(resumo?.parentElement?.className).toContain("px-4");
    // e o container NÃO tem px
    const raiz = container.querySelector(".flex.flex-col.gap-4");
    expect(raiz?.className).not.toMatch(/(^|\s)px-4(\s|$)/);
    expect(raiz?.className).not.toMatch(/(^|\s)p-4(\s|$)/);
  });

  it("⚠️ a faixa de filtros mantém o SEU px-4, sem somar com o pai", async () => {
    montar();
    await screen.findByText("Ana Silva");

    expect(screen.getByTestId("dash-filter-bar").className).toContain("px-4");
  });
});

describe("RelatorioSimulado — nota por matéria (card 07)", () => {
  const materia = (id: string, nome: string, media: number) => ({
    id,
    nome,
    media,
    base: 2,
  });

  const comMaterias = (id: string, nota: number) => [
    { id, nome: id, aproveitamento: nota, frentes: [] },
  ];

  /*
    Três notas — 0,1 / 0,5 / 0,9 — de propósito: média 0,5 e desvio 0,327, então
    o limiar é 0,173 e a Ana (0,1) É MARCADA. Filtrando só por "Ana" sobraria
    uma nota, o desvio sumiria e o realce desapareceria — é essa diferença que
    o teste do filtro exercita.
  */
  const RESPOSTA_COM_MATERIAS = {
    linhas: [
      {
        ...RESPOSTA.linhas[0],
        aproveitamentoPorMateria: comMaterias("mat", 0.1),
      },
      {
        ...RESPOSTA.linhas[0],
        usuario: "u2",
        nome: "Bruno Lima",
        matricula: "2025002",
        aproveitamentoPorMateria: comMaterias("mat", 0.5),
      },
      {
        ...RESPOSTA.linhas[0],
        usuario: "u3",
        nome: "Carla Souza",
        matricula: "2025003",
        aproveitamentoPorMateria: comMaterias("mat", 0.9),
      },
    ],
    resumo: {
      ...RESPOSTA.resumo,
      totalNoRecorte: 3,
      comLeituraConcluida: 3,
      aproveitamentoPorMateria: [materia("mat", "Matemática", 0.5)],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA_COM_MATERIAS);
  });

  it("a coluna da matéria aparece na tabela", async () => {
    montar();

    expect(await screen.findByText("Matemática")).toBeInTheDocument();
  });

  it("⚠️ filtrar por nome NÃO muda o conjunto de colunas", async () => {
    // As matérias saem do RESUMO, que é do recorte inteiro. Derivadas das
    // linhas, a busca por "Bruno" removeria a coluna de uma matéria que só a
    // Ana tem — e ver uma coluna desaparecer ao digitar faz a pessoa
    // desconfiar da tela toda.
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: "Bruno" },
    });

    await waitFor(() =>
      expect(screen.queryByText("Ana Silva")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Matemática")).toBeInTheDocument();
  });

  it("⚠️ o realce NÃO muda com o filtro — a referência é a TURMA", async () => {
    // Notas 0,1 / 0,5 / 0,9: média 0,5, desvio 0,327, limiar 0,173 — a Ana
    // (0,1) está marcada. Buscando "Ana" sobra UMA nota, e uma nota só não tem
    // dispersão: se o desvio saísse da lista filtrada, o realce sumiria ao
    // digitar. A referência é a turma, e turma não muda com filtro de tela.
    const { container } = montar();
    await screen.findByText("Ana Silva");

    expect(container.querySelector("[data-abaixo-da-turma]")).not.toBeNull();

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: "Ana" },
    });

    await waitFor(() =>
      expect(screen.queryByText("Bruno Lima")).not.toBeInTheDocument(),
    );
    // segue marcada — é o ponto do teste
    expect(container.querySelector("[data-abaixo-da-turma]")).not.toBeNull();
  });

  it("⚠️ o CSV traz TODAS as matérias, sem o teto da tela", async () => {
    // Planilha não tem problema de largura, e o teto de 4 existe só porque a
    // tabela estoura em 1565px.
    buscarRelatorio.mockResolvedValue({
      ...RESPOSTA_COM_MATERIAS,
      resumo: {
        ...RESPOSTA_COM_MATERIAS.resumo,
        aproveitamentoPorMateria: [
          materia("m1", "A", 0.5),
          materia("m2", "B", 0.5),
          materia("m3", "C", 0.5),
          materia("m4", "D", 0.5),
          materia("m5", "E", 0.5),
          materia("m6", "F", 0.5),
        ],
      },
    });
    montar();
    await screen.findByText("Ana Silva");

    fireEvent.click(screen.getByTestId("exportar-csv"));

    const [cabecalho] = exportAnalyticsCsv.mock.calls[0];
    for (const nome of ["A", "B", "C", "D", "E", "F"]) {
      expect(cabecalho).toContain(`${nome} (%)`);
    }
  });

  it("⚠️ a TELA respeita o teto de 4, mostrando as piores", async () => {
    buscarRelatorio.mockResolvedValue({
      ...RESPOSTA_COM_MATERIAS,
      resumo: {
        ...RESPOSTA_COM_MATERIAS.resumo,
        aproveitamentoPorMateria: [
          materia("m1", "Melhor", 0.95),
          materia("m2", "Ruim1", 0.2),
          materia("m3", "Ruim2", 0.3),
          materia("m4", "Ruim3", 0.4),
          materia("m5", "Ruim4", 0.5),
        ],
      },
    });
    montar();
    await screen.findByText("Ana Silva");

    expect(screen.queryByText("Melhor")).not.toBeInTheDocument();
    expect(screen.getByText("Ruim1")).toBeInTheDocument();
  });
});

describe("RelatorioSimulado — acertos e desvio (card 08)", () => {
  const RESPOSTA_08 = {
    linhas: [
      { ...RESPOSTA.linhas[0], acertos: 61, aproveitamentoGeral: 0.68 },
      {
        ...RESPOSTA.linhas[0],
        usuario: "u2",
        nome: "Bruno Lima",
        matricula: "2025002",
        acertos: 36,
        aproveitamentoGeral: 0.4,
      },
    ],
    resumo: {
      ...RESPOSTA.resumo,
      totalNoRecorte: 2,
      comLeituraConcluida: 2,
      aproveitamentoGeral: 0.54,
      totalDeQuestoes: 90,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA_08);
  });

  it("mostra os acertos absolutos na tabela", async () => {
    montar();

    expect(await screen.findByText("61/90")).toBeInTheDocument();
    expect(screen.getByText("36/90")).toBeInTheDocument();
  });

  it("⚠️ o desvio NÃO muda com o filtro — a referência é o recorte", async () => {
    // A média vem do RESUMO, que é do recorte inteiro. Derivada das linhas
    // filtradas, buscar "Ana" deixaria uma linha só, a média viraria a própria
    // nota dela, e "+14 p.p." viraria "0 p.p." — o número mudaria de sentido a
    // cada tecla.
    montar();
    await screen.findByText("61/90");

    expect(screen.getByText(/\+14 p\.p\./)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: "Ana" },
    });

    await waitFor(() =>
      expect(screen.queryByText("Bruno Lima")).not.toBeInTheDocument(),
    );
    expect(screen.getByText(/\+14 p\.p\./)).toBeInTheDocument();
  });

  it("⚠️ o CSV traz `Acertos` e `Total de questões` em colunas separadas", async () => {
    // No Excel, "61/90" é texto: não soma, não ordena, não vira gráfico.
    montar();
    await screen.findByText("61/90");

    fireEvent.click(screen.getByTestId("exportar-csv"));

    const [cabecalho, linhasCsv] = exportAnalyticsCsv.mock.calls[0];
    expect(cabecalho).toContain("Acertos");
    expect(cabecalho).toContain("Total de questões");
    expect(linhasCsv[0][cabecalho.indexOf("Acertos")]).toBe(61);
    expect(linhasCsv[0][cabecalho.indexOf("Total de questões")]).toBe(90);
  });
});

describe("RelatorioSimulado — distribuição da turma (card 09)", () => {
  /** 10 estudantes, com acertos espalhados — acima dos dois mínimos. */
  const RESPOSTA_09 = {
    linhas: Array.from({ length: 10 }, (_, i) => ({
      ...RESPOSTA.linhas[0],
      usuario: `u${i}`,
      nome: `Aluno ${i}`,
      matricula: `20250${i}`,
      acertos: 30 + i * 5,
      aproveitamentoGeral: (30 + i * 5) / 90,
    })),
    resumo: {
      ...RESPOSTA.resumo,
      totalNoRecorte: 10,
      comLeituraConcluida: 10,
      aproveitamentoGeral: 0.58,
      totalDeQuestoes: 90,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    buscarRelatorio.mockResolvedValue(RESPOSTA_09);
  });

  it("mostra mediana e faixa no resumo", async () => {
    montar();

    // acertos 30,35,…,75 → mediana (50+55)/2 = 52,5; faixa 30–75
    const bloco = await screen.findByTestId("resumo-distribuicao");
    expect(bloco).toHaveTextContent("mediana 52.5");
    expect(bloco).toHaveTextContent("30–75");
  });

  it("desenha o histograma", async () => {
    montar();

    expect(await screen.findByTestId("histograma-da-turma")).toBeInTheDocument();
  });

  it("⚠️ a mediana NÃO muda com o filtro de busca", async () => {
    // O recorte é a tela; filtro não é escopo. Mesma decisão do desvio por
    // matéria (card 07) e da média do card 08. Buscando um aluno, a mediana
    // viraria a nota dele se fosse derivada da lista filtrada.
    montar();
    const antes = (await screen.findByTestId("resumo-distribuicao")).textContent;

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: "Aluno 1" },
    });

    await waitFor(() =>
      expect(screen.queryByText("Aluno 5")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("resumo-distribuicao").textContent).toBe(antes);
  });

  it("⚠️ turma pequena: sem histograma, e o banner diz por quê", async () => {
    // Quatro barras de altura 1 parecem distribuição. O `SampleSizeBanner` é o
    // MESMO do agregado mensal da turma, generalizado neste card.
    buscarRelatorio.mockResolvedValue({
      linhas: RESPOSTA_09.linhas.slice(0, 3),
      resumo: { ...RESPOSTA_09.resumo, totalNoRecorte: 3, comLeituraConcluida: 3 },
    });
    montar();
    await screen.findByText("Aluno 0");

    expect(screen.queryByTestId("histograma-da-turma")).not.toBeInTheDocument();
    expect(screen.getByTestId("sample-size-banner")).toHaveTextContent(
      /apenas 3 aluno\(s\) com cartão lido/,
    );
  });

  it("⚠️ com base suficiente, nenhum banner aparece", async () => {
    montar();
    await screen.findByTestId("histograma-da-turma");

    expect(screen.queryByTestId("sample-size-banner")).not.toBeInTheDocument();
  });

  it("⚠️ recorte sem ninguém lido não mostra banner de amostra", async () => {
    // O vazio da tabela já explica; um aviso de amostra pequena em cima disso
    // seria ruído sobre ruído.
    buscarRelatorio.mockResolvedValue({
      linhas: [
        {
          ...RESPOSTA.linhas[0],
          enviouCartao: false,
          status: undefined,
          acertos: undefined,
        },
      ],
      resumo: {
        ...RESPOSTA_09.resumo,
        totalNoRecorte: 1,
        comLeituraConcluida: 0,
        aproveitamentoGeral: null,
      },
    });
    montar();
    // ⚠️ Ancorado no resumo, não na linha: quem não enviou começa ESCONDIDO
    // (o toggle nasce falso), então a tabela está vazia neste cenário.
    await screen.findByText("0 de 1");

    expect(screen.queryByTestId("sample-size-banner")).not.toBeInTheDocument();
  });
});
