import { fireEvent } from "@testing-library/dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROTULO_DA_DIFICULDADE } from "./recorteDoRelatorio";
import {
  DetalheDoEstudante,
  TEXTO_PROCESSANDO,
  TEXTO_SEM_RESPOSTAS,
  TEXTO_STATUS_DESCONHECIDO,
} from "./DetalheDoEstudante";

const buscarDetalheDoEstudante = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarDetalheDoEstudante", () => ({
  buscarDetalheDoEstudante,
}));

const reprocessarCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/cartaoResposta/reprocessarCartao", () => ({
  reprocessarCartao,
}));

const FALHA_DE_FOTO = {
  status: "failed",
  falha: {
    codigo: "cartao_nao_detectado",
    descricao: "Não foi possível localizar o cartão na foto",
    acaoSugerida: "reenviar_foto",
  },
  respostas: [],
};

const resposta = (over = {}) => ({
  numero: 1,
  questaoId: "q1",
  alternativaEstudante: "A",
  alternativaCorreta: "A",
  resultado: "acerto",
  ...over,
});

const montar = (props = {}) =>
  render(
    <DetalheDoEstudante
      token="tok"
      simuladoId="sim-1"
      estudante={{ usuario: "u1", nome: "Ana Silva", matricula: "2025001" }}
      isOpen
      onClose={vi.fn()}
      {...props}
    />,
  );

describe("DetalheDoEstudante", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reprocessarCartao.mockResolvedValue(undefined);
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [
        resposta(),
        resposta({
          numero: 2,
          questaoId: "q2",
          alternativaEstudante: "B",
          alternativaCorreta: "C",
          resultado: "erro",
        }),
        resposta({
          numero: 3,
          questaoId: "q3",
          alternativaEstudante: undefined,
          alternativaCorreta: "D",
          resultado: "sem_leitura",
        }),
      ],
    });
  });

  it("mostra o nome de quem está sendo visto", async () => {
    montar();

    expect(await screen.findByText(/Ana Silva/)).toBeInTheDocument();
  });

  it("busca o detalhe do estudante da linha, no simulado da tela", async () => {
    montar();

    await waitFor(() =>
      expect(buscarDetalheDoEstudante).toHaveBeenCalledWith("tok", "sim-1", "u1"),
    );
  });

  it("uma linha por questão, com marcada e correta", async () => {
    const { container } = montar();

    await screen.findByText("1");
    expect(screen.getAllByRole("row").length).toBeGreaterThanOrEqual(4);

    // ⚠️ Contar linha não prova que a linha diz alguma coisa. O que o professor
    // veio ver é o par marcada/correta da questão que ele errou.
    const q2 = container.querySelector('[data-row-key^="q2:"]') as HTMLElement;
    expect(within(q2).getByText("2")).toBeInTheDocument();
    expect(
      within(q2.querySelector('[data-column-id="marcada"]') as HTMLElement).getByText("B"),
    ).toBeInTheDocument();
    expect(
      within(q2.querySelector('[data-column-id="correta"]') as HTMLElement).getByText("C"),
    ).toBeInTheDocument();
  });

  it("⚠️ sem leitura não inventa uma alternativa marcada", async () => {
    // a chave não existe: mostrar "A" ou "-" como se fosse marcação seria
    // afirmar o que ninguém leu
    const { container } = montar();

    await screen.findByText("1");
    const q3 = container.querySelector('[data-row-key^="q3:"]') as HTMLElement;

    expect(
      q3.querySelector('[data-column-id="marcada"]')?.textContent?.trim(),
    ).toBe("—");
    expect(
      within(q3.querySelector('[data-column-id="correta"]') as HTMLElement).getByText("D"),
    ).toBeInTheDocument();
  });

  it("⚠️ certo/errado NÃO depende só de cor — há texto ou símbolo", async () => {
    // verde e vermelho sozinhos excluem quem não distingue as duas. E as
    // medições do tokens.ts: green3 dá 3.77:1 e red 3.88:1 sobre branco —
    // passa para componente gráfico, não para texto pequeno.
    montar();

    expect(await screen.findByText(/acertou/i)).toBeInTheDocument();
    expect(screen.getByText(/errou/i)).toBeInTheDocument();
  });

  it("⚠️ sem leitura é distinguível de erro", async () => {
    // juntar os dois distorce a leitura que o professor faz
    montar();

    expect(await screen.findByText(/sem leitura/i)).toBeInTheDocument();
  });

  it("histórico falho mostra a descrição do erro, não tabela vazia", async () => {
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "failed",
      falha: {
        codigo: "cartao_nao_detectado",
        descricao: "Não foi possível localizar o cartão na foto",
        acaoSugerida: "reenviar_foto",
      },
      respostas: [],
    });
    montar();

    expect(
      await screen.findByText(/não foi possível localizar o cartão/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("⚠️ cartão falho com histórico oferece a ação sugerida pelo ms", async () => {
    // `reenviar_foto` → seletor de arquivo. Quem decide é o `acaoSugerida`
    // dentro da falha; esta tela não conhece código de erro nenhum.
    buscarDetalheDoEstudante.mockResolvedValue(FALHA_DE_FOTO);
    const { container } = montar({
      estudante: {
        usuario: "u1",
        nome: "Ana Silva",
        matricula: "2025001",
        historicoId: "h1",
      },
    });

    await screen.findByText(/não foi possível localizar o cartão/i);
    expect(container.querySelector('input[type="file"]')).toBeTruthy();
  });

  it("⚠️ sem historicoId não oferece ação nenhuma", async () => {
    // o id vem da LINHA do relatório, e a api só o manda para quem enviou
    // cartão. Sem ele a rota de reprocessar não existe — e um botão que só
    // sabe dar 404 é pior que nenhum botão.
    buscarDetalheDoEstudante.mockResolvedValue(FALHA_DE_FOTO);
    const { container } = montar();

    await screen.findByText(/não foi possível localizar o cartão/i);
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByText(/reenviar foto/i)).not.toBeInTheDocument();
  });

  it("⚠️ depois do reenvio o detalhe recarrega e volta como processando", async () => {
    // o reenvio reabre o histórico no ms; a tela que continuasse mostrando
    // "falhou" convidaria a pessoa a reenviar de novo — e a segunda tentativa
    // cairia na janela entre tentativas.
    buscarDetalheDoEstudante.mockResolvedValueOnce(FALHA_DE_FOTO);
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "awaiting_omr",
      respostas: [],
    });
    const { container } = montar({
      estudante: {
        usuario: "u1",
        nome: "Ana Silva",
        matricula: "2025001",
        historicoId: "h1",
      },
    });

    await screen.findByText(/não foi possível localizar o cartão/i);
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["foto"], "cartao.jpg", { type: "image/jpeg" })] },
    });

    await waitFor(() =>
      expect(reprocessarCartao).toHaveBeenCalledWith(
        "tok",
        "h1",
        expect.any(File),
      ),
    );
    expect(await screen.findByText(TEXTO_PROCESSANDO)).toBeInTheDocument();
    expect(buscarDetalheDoEstudante).toHaveBeenCalledTimes(2);
  });

  it.each([["awaiting_omr"], ["pending"], ["processing"]])(
    "status %s diz que ainda está processando",
    async (status) => {
      buscarDetalheDoEstudante.mockResolvedValue({ status, respostas: [] });
      montar();

      expect(
        await screen.findByText(/processando|aguardando/i),
      ).toBeInTheDocument();
    },
  );

  it("⚠️ não busca enquanto está fechado", async () => {
    // o modal é montado pela tela do relatório junto com a linha; buscar aqui
    // seria uma chamada por linha da tabela
    montar({ isOpen: false });

    await waitFor(() => expect(buscarDetalheDoEstudante).not.toHaveBeenCalled());
  });

  it("erro na busca é recuperável", async () => {
    buscarDetalheDoEstudante.mockRejectedValueOnce(new Error("caiu"));
    montar();

    const tentar = await screen.findByRole("button", {
      name: /tentar novamente/i,
    });
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [resposta()],
    });
    fireEvent.click(tentar);

    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  it('⚠️ status que o client não conhece NÃO vira "nenhuma resposta"', async () => {
    // O `statusDaLinha` já tem um `default` honesto ("Situação desconhecida",
    // nunca "Lido"). Aqui não havia nenhum: um status fora dos cinco caía na
    // tabela e a tela dizia "Nenhuma resposta neste cartão" — que AFIRMA que o
    // estudante não respondeu nada, quando o que se sabe é só que não se sabe.
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "arquivado_pelo_ms",
      respostas: [],
    });
    montar();

    expect(await screen.findByText(TEXTO_STATUS_DESCONHECIDO)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_SEM_RESPOSTAS)).not.toBeInTheDocument();
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("⚠️ status desconhecido nunca afirma que a leitura terminou", async () => {
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "futuro",
      respostas: [],
    });
    montar();

    await screen.findByText(TEXTO_STATUS_DESCONHECIDO);
    expect(screen.queryByText(/acertou|errou|sem leitura/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/processando/i)).not.toBeInTheDocument();
  });

  it("⚠️ questão repetida no simulado não gera key duplicada no React", async () => {
    // corrida conhecida do `adicionarEmProva` pode pôr a mesma questão duas
    // vezes. As linhas seriam idênticas (nenhum dado errado), mas a key do
    // React colidiria.
    const erros: unknown[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
      erros.push(args[0]);
    });

    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [resposta(), resposta()],
    });
    const { container } = montar();

    // `findAllByText`: são DUAS linhas com o mesmo número, é esse o ponto
    await screen.findAllByText("1");
    expect(container.querySelectorAll('[data-row-key^="q1"]')).toHaveLength(2);
    expect(
      erros.filter((e) => String(e).includes("same key")),
    ).toHaveLength(0);

    spy.mockRestore();
  });
});

describe("DetalheDoEstudante — bloco de resumo (card 10)", () => {
  /**
   * O card 10: o modal abria com o nome e imediatamente 90 linhas. O detalhe
   * responde "o que ele marcou na 34?"; quem abre o modal quase sempre chega
   * com "por que o Pedro foi mal?".
   */
  const linha = {
    usuario: "u1",
    nome: "Ana Silva",
    matricula: "2025001",
    turmaId: null,
    turmaNome: null,
    enviouCartao: true,
    status: "completed" as const,
    acertos: 45,
    aproveitamentoGeral: 0.5,
    aproveitamentoPorMateria: [
      { id: "mat", nome: "Matemática", aproveitamento: 0.3, frentes: [] },
    ],
  };

  /*
    ⚠️ `beforeEach` PRÓPRIO: o do describe acima não alcança este, e sem ele os
    `it.each` de status deixariam o mock apontando para `status_do_futuro` no
    teste seguinte — que passaria a falhar por contágio, não pelo que afirma.
  */
  beforeEach(() => {
    vi.clearAllMocks();
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [resposta()],
    });
  });

  const comLinha = (props = {}) =>
    montar({
      estudante: { usuario: "u1", nome: "Ana Silva", matricula: "2025001", linha },
      totalDeQuestoes: 90,
      mediaDoRecorte: 0.36,
      materiasDaTurma: [
        { id: "mat", nome: "Matemática", media: 0.52, base: 27 },
      ],
      ...props,
    });

  it("aparece acima da tabela quando o cartão foi lido", async () => {
    comLinha();

    expect(await screen.findByTestId("resumo-do-estudante")).toBeInTheDocument();
    expect(screen.getByText("45/90 acertos")).toBeInTheDocument();
  });

  it("⚠️ a tabela de questões continua exatamente como está", async () => {
    // Critério explícito do card: o bloco ACRESCENTA, não substitui. O detalhe
    // questão a questão é o melhor pedaço de design da feature.
    comLinha();
    await screen.findByTestId("resumo-do-estudante");

    expect(screen.getByText("Marcou")).toBeInTheDocument();
    // ⚠️ O rótulo da coluna de dificuldade virou dinâmico (card 18): o padrão
    // é o recorte do cursinho, que é o caminho do `dashProvas`.
    expect(
      screen.getByText(ROTULO_DA_DIFICULDADE.cursinho),
    ).toBeInTheDocument();
  });

  it.each([
    ["failed", { status: "failed", falha: { codigo: "x", descricao: "falhou", acaoSugerida: "reenviar_foto" }, respostas: [] }],
    ["processando", { status: "pending", respostas: [] }],
    ["desconhecido", { status: "status_do_futuro", respostas: [] }],
  ])("⚠️ NÃO aparece em %s", async (_nome, detalhe) => {
    // Cada um desses já tem a sua mensagem, e o modal é explícito em não
    // afirmar nada. Um bloco de notas ao lado de "a leitura deste cartão
    // falhou" afirmaria a leitura que não houve.
    buscarDetalheDoEstudante.mockResolvedValue(detalhe);
    comLinha();

    await waitFor(() =>
      expect(buscarDetalheDoEstudante).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId("resumo-do-estudante")).not.toBeInTheDocument();
  });

  it("⚠️ sem a linha do relatório, o modal segue funcionando sem o bloco", async () => {
    // É o estado dos testes que só exercitam a tabela — e de qualquer chamador
    // que não tenha a linha em mãos.
    montar();

    expect(await screen.findByText("Marcou")).toBeInTheDocument();
    expect(screen.queryByTestId("resumo-do-estudante")).not.toBeInTheDocument();
  });

  it("⚠️ nenhum número do bloco é recalculado a partir das respostas", async () => {
    // O contrato diz 45 acertos; as respostas carregadas dizem outra coisa.
    // Recalcular produziria um segundo número para a mesma coisa, e os dois
    // divergiriam no primeiro `null` tratado diferente.
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [
        resposta(),
        resposta({ numero: 2, questaoId: "q2", alternativaEstudante: "B", alternativaCorreta: "C", resultado: "erro" }),
      ],
    });
    comLinha();

    // 45 do contrato, e não 1 das duas respostas presentes
    expect(await screen.findByText("45/90 acertos")).toBeInTheDocument();
  });
});

describe("DetalheDoEstudante — rótulo da dificuldade por recorte (card 18)", () => {
  /**
   * O rótulo era fixo em "Acertos na turma" — e mentia justamente no caminho
   * mais comum: o `dashProvas` abre o relatório do **cursinho inteiro**, sem
   * turma nenhuma. Quem lia "na turma" ali concluía que estava vendo um recorte
   * que não pediu.
   *
   * ⚠️ O agregado vem do MESMO recorte do relatório aberto (`simuladoId` +
   * `turmaId`), então o rótulo pode — e deve — dizer qual é.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    buscarDetalheDoEstudante.mockResolvedValue({
      status: "completed",
      respostas: [resposta()],
    });
  });

  it("⚠️ sem turma, o rótulo diz CURSINHO", async () => {
    montar({ recorte: "cursinho" });

    expect(
      await screen.findByText(ROTULO_DA_DIFICULDADE.cursinho),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(ROTULO_DA_DIFICULDADE.turma),
    ).not.toBeInTheDocument();
  });

  it("com turma, o rótulo diz TURMA", async () => {
    montar({ recorte: "turma" });

    expect(
      await screen.findByText(ROTULO_DA_DIFICULDADE.turma),
    ).toBeInTheDocument();
  });

  it("⚠️ o padrão é `cursinho` — é o caso que estava errado", async () => {
    // Quem montar o modal sem informar o recorte cai no caminho do
    // `dashProvas`, que é o mais comum e o que o rótulo fixo rotulava mal.
    montar();

    expect(
      await screen.findByText(ROTULO_DA_DIFICULDADE.cursinho),
    ).toBeInTheDocument();
  });

  it("⚠️ os dois rótulos são diferentes — senão a distinção não existe", () => {
    expect(ROTULO_DA_DIFICULDADE.turma).not.toBe(
      ROTULO_DA_DIFICULDADE.cursinho,
    );
  });

  it("⚠️ nenhum dos dois é neutro — os dois nomeiam o recorte", async () => {
    // "% de acerto" ou "Acertos gerais" resolveriam a mentira trocando-a por
    // vaguidão: o número NUNCA é geral, é sempre de um recorte. Dizer qual é o
    // que deixa o coordenador julgar a amostra — mesmo motivo de a base andar
    // junto na célula.
    for (const rotulo of Object.values(ROTULO_DA_DIFICULDADE)) {
      expect(rotulo).toMatch(/turma|cursinho/i);
    }
  });
});
