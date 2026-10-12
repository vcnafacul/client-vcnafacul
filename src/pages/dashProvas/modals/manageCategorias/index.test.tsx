import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { getCategorias } from "../../../../services/categoria/getCategorias";
import ManageCategorias from "./index";
import { TEXTO_COMPARTILHADA } from "./protectedTipos";

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

  describe("categoria com nome de seedada (card 39)", () => {
    const comNomeDeSeedada: ICategoria = { ...categoria, nome: "Enem Dia 1" };

    it("⚠️ no cursinho (protegerSeedadas=false): sem 🔒 e lixeira habilitada", async () => {
      render(
        <ManageCategorias
          isOpen
          handleClose={vi.fn()}
          onCategoriasChanged={vi.fn()}
          listarService={vi.fn(async () => ({ data: [comNomeDeSeedada] }))}
          nomeLivre
          protegerSeedadas={false}
        />,
      );

      expect(await screen.findByText("Enem Dia 1")).toBeInTheDocument();
      expect(screen.queryByText(/Categoria seedada/)).not.toBeInTheDocument();
      expect(screen.getByTitle("Excluir categoria")).toBeEnabled();
    });

    it("na plataforma (padrão): continua travada pelo nome", async () => {
      renderModal([comNomeDeSeedada]);

      expect(
        await screen.findByText("🔒 Categoria seedada"),
      ).toBeInTheDocument();
      expect(
        screen.getByTitle("Categoria seedada — não pode ser excluída"),
      ).toBeDisabled();
    });
  });

  describe("compartilhada Enem Dia 1/2 do cursinho (tickets/038)", () => {
    it("⚠️ no cursinho: travada com o motivo, mesmo com protegerSeedadas=false", async () => {
      const compartilhada: ICategoria = {
        ...categoria,
        _id: "c-enem",
        nome: "Enem Dia 1",
        custom: false,
        dono: "Cursinho",
      };
      render(
        <ManageCategorias
          isOpen
          handleClose={vi.fn()}
          onCategoriasChanged={vi.fn()}
          listarService={vi.fn(async () => ({ data: [compartilhada] }))}
          nomeLivre
          protegerSeedadas={false}
        />,
      );

      expect(
        await screen.findByText(`🔒 ${TEXTO_COMPARTILHADA}`),
      ).toBeInTheDocument();
      expect(screen.getByTitle(TEXTO_COMPARTILHADA)).toBeDisabled();
    });
  });
});

/**
 * ⚠️ A resposta da criação traz o `exame` só como id. Se ela fosse direto para
 * a tela, o "Nova prova" — que monta a lista de exames a partir de
 * `categoria.exame` — não mostraria o exame de uma categoria recém-criada
 * até recarregar a página.
 */
describe("ManageCategorias — depois de criar, a tela recebe a lista do servidor", () => {
  it("entrega a categoria nova com o exame completo", async () => {
    const completa: ICategoria = { ...categoria, _id: "c2", nome: "Mensal" };
    const listar = vi
      .fn()
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [completa] });
    const criar = vi.fn(async () => ({
      ...completa,
      exame: "e1" as unknown as ICategoria["exame"],
    }));
    const onCategoriasChanged = vi.fn();
    render(
      <ManageCategorias
        isOpen
        handleClose={vi.fn()}
        onCategoriasChanged={onCategoriasChanged}
        listarService={listar}
        criarService={criar}
        nomeLivre
      />,
    );
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: /Nova Categoria/ }));
    await screen.findByRole("option", { name: "ENEM" });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "e1" } });
    fireEvent.change(screen.getByLabelText(/^Duração \(min\) \*$/), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText(/^Nome \*$/), {
      target: { value: "Mensal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(onCategoriasChanged).toHaveBeenLastCalledWith([completa]),
    );
  });
});

/**
 * O jsdom não mede altura: o que dá para trancar aqui é a estrutura — o modal
 * tem teto de 90% da tela, a lista é quem rola, e o cabeçalho (título, Nova
 * Categoria e busca) fica fora dela.
 */
describe("ManageCategorias — altura limitada, só a lista rola", () => {
  it("lista rolável, com o cabeçalho fora dela", async () => {
    renderModal([categoria]);
    await screen.findByText("Enem 90q 180min");

    const lista = document.querySelector('[data-slot="lista-de-categorias"]')!;
    expect(lista.className).toContain("overflow-y-auto");
    expect(lista).toContainElement(screen.getByText("Enem 90q 180min"));
    expect(lista).not.toContainElement(
      screen.getByRole("heading", { name: "Gerenciar Categorias" }),
    );
    expect(lista).not.toContainElement(
      screen.getByRole("button", { name: /Nova Categoria/ }),
    );
    expect(lista).not.toContainElement(
      screen.getByPlaceholderText("Buscar por nome"),
    );
    expect(lista.closest(".max-h-\\[90dvh\\]")).not.toBeNull();
  });
});
