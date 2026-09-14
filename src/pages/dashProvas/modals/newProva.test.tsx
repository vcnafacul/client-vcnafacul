import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICategoria } from "../../../dtos/categoria/categoria";

const createProva = vi.hoisted(() =>
  // ⚠️ Os parâmetros são declarados para o `mock.calls[0][0]` abaixo ter tipo.
  // Sem eles o TS vê uma tupla vazia e o `yarn build` reprova.
  vi.fn(async (_formData: FormData, _token: string) => ({ _id: "p1" })),
);
vi.mock("../../../services/prova/createProva", () => ({ createProva }));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("../../../hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({ action }: { action: () => Promise<unknown> }) =>
      action(),
}));

import NewProva from "./newProva";

const CUSTOM = {
  _id: "cat-custom",
  nome: "Personalizado 30q 60min",
  custom: true,
  selecionavel: true,
  quantidadeTotalQuestao: 30,
} as unknown as ICategoria;

function montar() {
  return render(
    <NewProva
      isOpen
      categorias={[CUSTOM]}
      addProva={vi.fn()}
      handleClose={vi.fn()}
    />,
  );
}

/** Seleciona a categoria custom, que é o que revela os campos de prova custom. */
function escolherCategoriaCustom() {
  const select = document.querySelector("select") as HTMLSelectElement;
  fireEvent.change(select, { target: { value: CUSTOM._id } });
}

/**
 * ⚠️ Busca por `name`, e não por `getByLabelText`. O "label" deste formulário é
 * uma `div` flutuante posicionada por CSS, sem `htmlFor` — os campos não têm
 * nome acessível. É defeito de acessibilidade pré-existente, fora do escopo
 * deste conserto, mas é por isso que o seletor aqui é o que é.
 */
const campo = (nome: string) =>
  document.querySelector(`[name="${nome}"]`) as HTMLInputElement | null;

beforeEach(() => createProva.mockClear());

describe("NewProva — prova personalizada", () => {
  it("não pede mais o nome do simulado", () => {
    /**
     * ⚠️ Prova custom gera exatamente 1 simulado, então pedir dois nomes era
     * pedir a mesma informação duas vezes.
     */
    montar();
    escolherCategoriaCustom();

    expect(campo("nome")).not.toBeNull();
    expect(campo("nomeSimulado")).toBeNull();
    // O rótulo visível também tem que sumir, não só o input.
    expect(screen.queryByText(/Nome do simulado/i)).toBeNull();
    expect(screen.getByText(/Nome da prova/i)).toBeInTheDocument();
  });

  it("envia o nome da prova TAMBÉM como nome do simulado", async () => {
    /**
     * ⚠️ O campo saiu da tela, **não da requisição**. O
     * `CustomProvaFactory.createSimulados` do ms lança 400 quando
     * `nomeSimulado` vem vazio — simplesmente parar de enviar quebraria a
     * criação, e o erro apareceria como "Bad Request" sem explicar nada.
     */
    montar();
    escolherCategoriaCustom();

    fireEvent.change(campo("nome")!, {
      target: { value: "Simulado de março" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Criar|Salvar/i }));

    await waitFor(() => expect(createProva).toHaveBeenCalled());

    const formData = createProva.mock.calls[0][0];
    expect(formData.get("nome")).toBe("Simulado de março");
    expect(formData.get("nomeSimulado")).toBe("Simulado de março");
  });
});
