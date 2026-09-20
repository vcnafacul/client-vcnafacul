import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    await screen.findByText(/erro/i);
    fireEvent.click(screen.getByRole("button", { name: /tentar novamente/i }));

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

    fireEvent.click(await screen.findByText("Ana Silva"));

    expect(buscarDetalheDoEstudante).not.toHaveBeenCalled();
  });
});
