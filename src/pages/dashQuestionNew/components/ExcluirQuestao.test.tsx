import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExcluirQuestao } from "./ExcluirQuestao";
import { TEXTO_EXCLUIR, TITULO_CONFIRMAR_EXCLUSAO } from "./textoDaLinhagem";

const podeExcluirQuestao = vi.hoisted(() => vi.fn());
const excluirQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/excluirQuestao", () => ({
  podeExcluirQuestao,
  excluirQuestao,
}));

const estado = vi.hoisted(() => ({
  permissao: { validarQuestao: true } as Record<string, boolean>,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));

const montar = (aoExcluir = vi.fn()) => ({
  aoExcluir,
  ...render(<ExcluirQuestao questaoId="q1" aoExcluir={aoExcluir} />),
});

/*
  ⚠️ Um arquivo, poucas montagens do Dialog: Radix é caro no jsdom (ver a nota
  do Popper). Os casos de confirmação abrem o diálogo uma vez cada.
*/
describe("ExcluirQuestao (card 33)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { validarQuestao: true };
    podeExcluirQuestao.mockResolvedValue({ podeExcluir: true, motivos: [] });
  });

  it("⚠️ o botão só aparece quando o servidor diz que pode", async () => {
    podeExcluirQuestao.mockResolvedValue({
      podeExcluir: false,
      motivos: [{ codigo: "em-prova", texto: "está em prova" }],
    });
    const { container } = montar();

    await waitFor(() =>
      expect(podeExcluirQuestao).toHaveBeenCalledWith("tok", "q1"),
    );
    expect(container.querySelector("[data-excluir]")).toBeNull();
  });

  it("⚠️ sem `validarQuestao`, nem pergunta — a mesma guarda da api", async () => {
    estado.permissao = { criarQuestao: true };
    const { container } = montar();

    await Promise.resolve();
    expect(podeExcluirQuestao).not.toHaveBeenCalled();
    expect(container.querySelector("[data-excluir]")).toBeNull();
  });

  it("⚠️ a consulta falha em silêncio — e o botão NÃO aparece", async () => {
    // Não aparecer é o lado seguro.
    podeExcluirQuestao.mockRejectedValue(new Error("caiu"));
    const { container } = montar();

    await waitFor(() => expect(podeExcluirQuestao).toHaveBeenCalled());
    expect(container.querySelector("[data-excluir]")).toBeNull();
  });

  it("⚠️ excluir pede confirmação antes — e só exclui ao confirmar", async () => {
    excluirQuestao.mockResolvedValue({ excluida: true });
    const { aoExcluir } = montar();

    fireEvent.click(await screen.findByText(TEXTO_EXCLUIR));
    expect(await screen.findByText(TITULO_CONFIRMAR_EXCLUSAO)).toBeTruthy();
    expect(excluirQuestao).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => expect(aoExcluir).toHaveBeenCalled());
    expect(excluirQuestao).toHaveBeenCalledWith("tok", "q1");
  });

  it("⚠️ a recusa do servidor é tratada: mostra TODOS os motivos, não exclui", async () => {
    /*
      O botão não é a garantia: entre a consulta e o clique, alguém pôs a
      questão numa prova.
    */
    excluirQuestao.mockResolvedValue({
      excluida: false,
      mensagem: "não pode",
      motivos: [
        { codigo: "em-prova", texto: "A questão está em uma prova." },
        { codigo: "respondida", texto: "A questão já foi respondida." },
      ],
    });
    const { aoExcluir } = montar();

    fireEvent.click(await screen.findByText(TEXTO_EXCLUIR));
    fireEvent.click(await screen.findByText("Confirmar"));

    expect(
      await screen.findByText("A questão está em uma prova."),
    ).toBeTruthy();
    expect(screen.getByText("A questão já foi respondida.")).toBeTruthy();
    expect(aoExcluir).not.toHaveBeenCalled();
    // Confirmar de novo daria a mesma recusa.
    expect((screen.getByText("Confirmar") as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
