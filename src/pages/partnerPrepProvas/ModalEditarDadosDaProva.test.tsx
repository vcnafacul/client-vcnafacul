import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ editarDadosProvaCursinho: vi.fn() }));
vi.mock("@/services/prova/editarDadosProvaCursinho", () => svc);
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import {
  ModalEditarDadosDaProva,
  TEXTO_AVISO_CATEGORIA,
} from "./ModalEditarDadosDaProva";

const PROVA = {
  _id: "p1",
  nome: "teste",
  ano: 2023,
  edicao: "Regular",
  aplicacao: 1,
  categoria: "Mensal 45",
  totalQuestao: 45,
} as never;

const CATEGORIAS = [
  { _id: "c45", nome: "Mensal 45", quantidadeTotalQuestao: 45, selecionavel: true },
  { _id: "c90", nome: "Mensal 90", quantidadeTotalQuestao: 90, selecionavel: true },
  { _id: "cx", nome: "Fora de uso", quantidadeTotalQuestao: 10, selecionavel: false },
] as never;

const abrir = (onSalva = vi.fn(), handleClose = vi.fn()) => {
  render(
    <ModalEditarDadosDaProva
      prova={PROVA}
      categorias={CATEGORIAS}
      token="tk"
      isOpen
      handleClose={handleClose}
      onSalva={onSalva}
    />,
  );
  return { onSalva, handleClose };
};

describe("Editar dados da prova (card 41)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("abre com os dados atuais e a categoria pelo nome; só categorias em uso", () => {
    abrir();
    expect(screen.getByLabelText("Nome")).toHaveValue("teste");
    expect(screen.getByLabelText("Ano")).toHaveValue(2023);
    expect(screen.getByLabelText("Categoria")).toHaveValue("c45");
    expect(screen.queryByRole("option", { name: "Fora de uso" })).toBeNull();
    expect(screen.getByText(TEXTO_AVISO_CATEGORIA)).toBeInTheDocument();
  });

  it("⚠️ manda só o que mudou e devolve a prova atualizada", async () => {
    svc.editarDadosProvaCursinho.mockResolvedValue({ nome: "Simulado de abril" });
    const { onSalva } = abrir();

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: " Simulado de abril " },
    });
    fireEvent.change(screen.getByLabelText("Ano"), { target: { value: "2026" } });
    fireEvent.change(screen.getByLabelText("Edição"), {
      target: { value: "Replicacao" },
    });
    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: { value: "c90" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(onSalva).toHaveBeenCalled());
    expect(svc.editarDadosProvaCursinho).toHaveBeenCalledWith(
      "p1",
      { nome: "Simulado de abril", ano: 2026, edicao: "Replicacao", categoria: "c90" },
      "tk",
    );
    expect(onSalva.mock.calls[0][0]).toMatchObject({
      nome: "Simulado de abril",
      ano: 2026,
      categoria: "Mensal 90",
      totalQuestao: 90,
    });
  });

  it("sem mudança nenhuma: fecha sem chamar a api", () => {
    const { handleClose } = abrir();
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(svc.editarDadosProvaCursinho).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it("recusa da api (ex.: categoria com cartão): mostra o motivo e o modal fica", async () => {
    svc.editarDadosProvaCursinho.mockRejectedValue(
      new Error("Não dá para trocar a categoria: alunos já enviaram cartões desta prova."),
    );
    const { onSalva } = abrir();
    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: { value: "c90" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Não dá para trocar a categoria: alunos já enviaram cartões desta prova.",
      ),
    );
    expect(onSalva).not.toHaveBeenCalled();
  });
});
