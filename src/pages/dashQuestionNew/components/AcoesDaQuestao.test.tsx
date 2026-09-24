import { render, screen, waitFor } from "@testing-library/react";
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

describe("AcoesDaQuestao — duplicar saiu daqui (QA)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
    podeExcluirQuestao.mockResolvedValue({ podeExcluir: false, motivos: [] });
  });

  it("⚠️ nem com `criarQuestao` há botão de duplicar na Classificação", () => {
    const { container } = montar();

    expect(container.querySelector("[data-duplicar]")).toBeNull();
    expect(screen.queryByText(TEXTO_DUPLICAR)).toBeNull();
    expect(duplicarQuestao).not.toHaveBeenCalled();
  });

  it("o Excluir continua aqui", async () => {
    estado.permissao = { excluirQuestao: true };
    montar();

    await waitFor(() => expect(podeExcluirQuestao).toHaveBeenCalledWith("tok", "q1"));
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
