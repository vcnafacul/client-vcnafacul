import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/* -------------------------------------------------------------------------- *
 * O que está sob teste é o canal de volta: a lista de históricos do aluno é
 * onde o coordenador descobre POR QUE um cartão falhou. Serviços e o template
 * do modal entram como dublês.
 * -------------------------------------------------------------------------- */

const buscarResultados = vi.hoisted(() => vi.fn());
const uploadCartao = vi.hoisted(() => vi.fn(async () => undefined));
const toastUpdate = vi.hoisted(() => vi.fn());

vi.mock("../../../services/cartaoResposta/buscarResultados", () => ({
  buscarResultados,
}));
vi.mock("../../../services/cartaoResposta/uploadCartao", () => ({
  uploadCartao,
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: toastUpdate, error: vi.fn() },
}));
vi.mock("../../../components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import UploadCartaoModal from "./uploadCartaoModal";

const abrirEBuscar = async (historicos: unknown[]) => {
  buscarResultados.mockResolvedValue({
    estudante: { userId: "u1", nome: "Ana Silva", matricula: "2025001" },
    historicos,
  });
  render(<UploadCartaoModal isOpen handleClose={vi.fn()} token="t" />);
  fireEvent.change(screen.getByPlaceholderText(/Matrícula/i), {
    target: { value: "2025001" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Buscar/i }));
  await screen.findByText("Ana Silva");
};

describe("UploadCartaoModal — o motivo da falha", () => {
  it("mostra a descrição da falha em vez do status cru", async () => {
    await abrirEBuscar([
      {
        ano: 2025,
        status: "failed",
        falha: {
          codigo: "cartao_nao_detectado",
          descricao:
            "Não foi possível localizar o cartão na foto. Refotografe com o cartão inteiro visível e boa iluminação.",
          acaoSugerida: "reenviar_foto",
        },
      },
    ]);

    expect(
      screen.getByText(/Não foi possível localizar o cartão na foto/),
    ).toBeInTheDocument();
    expect(screen.queryByText("failed")).not.toBeInTheDocument();
  });

  it("sem falha, mostra o status como antes", async () => {
    await abrirEBuscar([{ ano: 2024, status: "completed" }]);

    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("o toast não afirma que o processamento deu certo", async () => {
    await abrirEBuscar([]);

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "c.jpg", { type: "image/jpeg" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enviar cartão/i }));

    await vi.waitFor(() => expect(toastUpdate).toHaveBeenCalled());
    const render_ = toastUpdate.mock.calls[0][1].render as string;
    // o sucesso era do UPLOAD, não da leitura
    expect(render_).not.toMatch(/Processando/i);
    expect(render_).toMatch(/quando o processamento terminar/i);
  });
});
