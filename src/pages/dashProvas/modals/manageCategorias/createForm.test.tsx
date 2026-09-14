import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import CreateForm from "./createForm";

/* -------------------------------------------------------------------------- *
 * O que está sob teste é o formulário, não a rede: o serviço de criação entra
 * por prop (`criarService`) e o toast vira dublê. Nada de Radix aqui — ver o
 * docblock no fim do arquivo.
 * -------------------------------------------------------------------------- */

vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(() => 1),
    update: vi.fn(),
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const criada: ICategoria = {
  _id: "c1",
  nome: "Enem Dia 1",
  duracao: 90,
  quantidadeTotalQuestao: null,
  exame: { _id: "e1", nome: "ENEM" },
  custom: true,
  selecionavel: true,
  descricao: "",
  simuladosCount: 0,
  provasCount: 0,
};

function renderForm(nomeLivre?: boolean) {
  const criar = vi.fn(async () => criada);
  render(
    <CreateForm
      exameOptions={[{ value: "e1", label: "ENEM" }]}
      token="tok"
      nomeLivre={nomeLivre}
      criarService={criar}
      onCreated={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
  return { criar };
}

/** Preenche o que é obrigatório em qualquer modo. */
function preencherObrigatorios() {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "e1" } });
  fireEvent.change(screen.getByLabelText(/^Duração \(min\) \*$/), {
    target: { value: "90" },
  });
}

describe("CreateForm — modo padrão (admin)", () => {
  it("coleta prefixo e mostra o preview do nome gerado pelo backend", () => {
    renderForm();

    expect(screen.getByLabelText(/^Prefixo \(opcional\)$/)).toBeInTheDocument();
    expect(screen.getByText(/Preview do nome/)).toBeInTheDocument();
  });
});

describe("CreateForm — nomeLivre (cursinho)", () => {
  it("troca o prefixo por um campo de nome e esconde o preview", () => {
    renderForm(true);

    expect(screen.getByLabelText(/^Nome \*$/)).toBeInTheDocument();
    /**
     * ⚠️ O preview espelha um pattern que não se aplica mais. Mostrar um nome
     * que a pessoa não vai receber é pior do que não mostrar nada.
     */
    expect(screen.queryByText(/Preview do nome/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Prefixo/)).not.toBeInTheDocument();
  });

  it("envia o nome digitado e nenhum prefixo", async () => {
    const { criar } = renderForm(true);

    preencherObrigatorios();
    fireEvent.change(screen.getByLabelText(/^Nome \*$/), {
      target: { value: "Enem Dia 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    const [payload, token] = criar.mock.calls[0] as unknown as [
      Record<string, unknown>,
      string,
    ];
    expect(payload.nome).toBe("Enem Dia 1");
    /**
     * ⚠️ Mutuamente exclusivos. Com os dois no corpo o backend resolve
     * `dto.nome ?? gerarNomeAuto(dto)`: o nome vence, o prefixo vira peso morto
     * e quem lê o código depois não sabe qual dos dois manda.
     */
    expect(payload).not.toHaveProperty("prefixo");
    expect(token).toBe("tok");
  });

  it("não envia com o nome vazio", async () => {
    const { criar } = renderForm(true);

    preencherObrigatorios();
    const salvar = screen.getByRole("button", { name: "Salvar" });

    expect(salvar).toBeDisabled();
    fireEvent.click(salvar);
    await waitFor(() => expect(criar).not.toHaveBeenCalled());
  });
});
