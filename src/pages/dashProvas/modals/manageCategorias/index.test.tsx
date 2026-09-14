import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { getCategorias } from "../../../../services/categoria/getCategorias";
import ManageCategorias from "./index";

/* -------------------------------------------------------------------------- *
 * Os serviços do admin entram como dublês porque este teste verifica quem é
 * chamado, não o que a rede responde. O ponto do ticket é que o modal serve às
 * duas dashboards, então o serviço injetado tem de vencer o import fixo.
 * -------------------------------------------------------------------------- */

vi.mock("../../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(() => 1),
    update: vi.fn(),
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("../../../../services/categoria/getCategorias", () => ({
  getCategorias: vi.fn(async () => ({ data: [] })),
}));
vi.mock("../../../../services/categoria/createCategoria", () => ({
  createCategoria: vi.fn(),
}));
vi.mock("../../../../services/categoria/deleteCategoria", () => ({
  deleteCategoria: vi.fn(),
}));
vi.mock("../../../../services/exame/getExames", () => ({
  getExames: vi.fn(async () => ({
    data: [{ _id: "e1", nome: "ENEM" }],
    page: 1,
    limit: 500,
    totalItems: 1,
  })),
}));

const categoria: ICategoria = {
  _id: "c1",
  nome: "Enem 90q 180min",
  duracao: 180,
  quantidadeTotalQuestao: 90,
  exame: { _id: "e1", nome: "ENEM" },
  custom: true,
  selecionavel: true,
  descricao: "",
  simuladosCount: 0,
  provasCount: 0,
};

function renderModal(categorias: ICategoria[]) {
  const listar = vi.fn(async () => ({ data: categorias }));
  render(
    <ManageCategorias
      isOpen
      handleClose={vi.fn()}
      onCategoriasChanged={vi.fn()}
      listarService={listar}
    />,
  );
  return { listar };
}

describe("ManageCategorias", () => {
  it("lista pelo serviço injetado, não pelo import fixo", async () => {
    const { listar } = renderModal([categoria]);

    await waitFor(() => expect(listar).toHaveBeenCalledWith("tok"));
    expect(getCategorias).not.toHaveBeenCalled();
    expect(await screen.findByText("Enem 90q 180min")).toBeInTheDocument();
  });

  /**
   * ⚠️ A lista de categorias vai **vazia** de propósito. Com o `useMemo` antigo,
   * que derivava os exames das categorias já carregadas, um cursinho novo não
   * teria opção nenhuma no dropdown — e não conseguiria criar a primeira
   * categoria. É exatamente esse buraco que este teste tranca.
   */
  it("busca os exames no serviço de exames, e não na lista de categorias", async () => {
    renderModal([]);

    fireEvent.click(screen.getByRole("button", { name: /Nova Categoria/ }));

    expect(
      await screen.findByRole("option", { name: "ENEM" }),
    ).toBeInTheDocument();
  });
});
