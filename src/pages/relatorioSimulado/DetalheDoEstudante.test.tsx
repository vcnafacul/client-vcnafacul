import { fireEvent } from "@testing-library/dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DetalheDoEstudante,
  TEXTO_SEM_RESPOSTAS,
  TEXTO_STATUS_DESCONHECIDO,
} from "./DetalheDoEstudante";

const buscarDetalheDoEstudante = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarDetalheDoEstudante", () => ({
  buscarDetalheDoEstudante,
}));

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
