import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicarQuestao } from "./DuplicarQuestao";
import { TEXTO_DUPLICAR } from "./textoDaLinhagem";

const duplicarQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/duplicarQuestao", () => ({ duplicarQuestao }));

const estado = vi.hoisted(() => ({
  permissao: { criarQuestao: true } as Record<string, boolean>,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));

const montar = (props: Record<string, unknown> = {}) =>
  render(<DuplicarQuestao questaoId="q1" {...props} />);

describe("DuplicarQuestao (card 25, no topo da Linhagem)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
    duplicarQuestao.mockResolvedValue({ _id: "q2" });
  });

  it("⚠️ o título do botão diz a CONSEQUÊNCIA na prova", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-duplicar]")?.getAttribute("title"),
    ).toContain("provas que usam esta questão não mudam");
  });

  it("⚠️ sem `criarQuestao` NÃO há botão", () => {
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
});
