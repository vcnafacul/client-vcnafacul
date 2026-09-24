import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AcoesDaQuestao } from "./AcoesDaQuestao";
import { TEXTO_DUPLICAR } from "./textoDaLinhagem";

const podeExcluirQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/excluirQuestao", () => ({
  podeExcluirQuestao,
  excluirQuestao: vi.fn(),
}));

const duplicarQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/duplicarQuestao", () => ({ duplicarQuestao }));

const estado = vi.hoisted(() => ({
  permissao: { criarQuestao: true } as Record<string, boolean>,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));

const montar = (props: Record<string, unknown> = {}) =>
  render(<AcoesDaQuestao questaoId="q1" {...props} />);

describe("AcoesDaQuestao — duplicar (card 25)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
    podeExcluirQuestao.mockResolvedValue({ podeExcluir: false, motivos: [] });
    duplicarQuestao.mockResolvedValue({ _id: "q2" });
  });

  it("⚠️ duplicar é botão à PARTE, fora do fluxo de edição", () => {
    // Decisão do card 27: duplicar nasce de "quero outra parecida", não de editar.
    montar();

    expect(screen.getByText(TEXTO_DUPLICAR)).toBeTruthy();
  });

  it("⚠️ o título do botão diz a CONSEQUÊNCIA na prova", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-duplicar]")?.getAttribute("title"),
    ).toContain("provas que usam esta questão não mudam");
  });

  it("⚠️ sem `criarQuestao` NÃO há botão de duplicar", () => {
    // Mesma guarda da api: um botão que só sabe receber 403 é pior que nenhum.
    estado.permissao = { validarQuestao: true };

    const { container } = montar();

    expect(container.querySelector("[data-duplicar]")).toBeNull();
  });

  it("duplicar chama o serviço e avisa quem montou", async () => {
    const aoDuplicar = vi.fn();
    montar({ aoDuplicar });

    fireEvent.click(screen.getByText(TEXTO_DUPLICAR));

    await waitFor(() => expect(aoDuplicar).toHaveBeenCalledWith("q2"));
    expect(duplicarQuestao).toHaveBeenCalledWith("tok", "q1");
  });

  it("⚠️ depois de duplicar, o Excluir pergunta de novo ao servidor", async () => {
    /*
      Duplicar torna esta questão origem de alguém, e origem não se exclui —
      o botão não pode continuar visível com a resposta de antes (card 33).
    */
    estado.permissao = { criarQuestao: true, excluirQuestao: true };
    montar();
    await waitFor(() => expect(podeExcluirQuestao).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText(TEXTO_DUPLICAR));

    await waitFor(() => expect(podeExcluirQuestao).toHaveBeenCalledTimes(2));
  });
});

describe("AcoesDaQuestao — posição no rodapé (revisão do card 25)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
  });

  it("⚠️ o bloco alinha à DIREITA — ações ficam no canto da ação", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-acoes-da-questao]")?.className,
    ).toContain("justify-end");
  });

  it("⚠️ tem separador do conteúdo acima", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-acoes-da-questao]")?.className,
    ).toContain("border-t");
  });
});
