import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShowDemand from "./showDemand";

const uploadFileDemand = vi.hoisted(() => vi.fn(async () => true));
const sendVideoDemand = vi.hoisted(() => vi.fn(async () => true));
vi.mock("../../../services/content/uploadFileDemand", () => ({
  uploadFileDemand,
}));
vi.mock("@/services/content/sendVideoDemand", () => ({ sendVideoDemand }));
vi.mock("../../../services/content/deleteDemand", () => ({
  deleteDemand: vi.fn(),
}));
vi.mock("@/components/atoms/docxPreview", () => ({ default: () => null }));
vi.mock("@/components/atoms/youtubePlayer", () => ({
  YoutubePlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="player">{videoId}</div>
  ),
}));
vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(),
    update: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const demand = {
  id: "d1",
  title: "Funções",
  description: "Material com teoria e exercícios.",
  status: 3,
  userId: "u-carla",
  createdByName: "Carla Mendes",
  createdAt: "2026-09-01T12:00:00Z",
  subject: { name: "Funções", frente: { nome: "Álgebra" } },
} as never;

const montar = () => {
  const handleClose = vi.fn();
  const updateStatusDemand = vi.fn();
  render(
    <ShowDemand
      isOpen
      demand={demand}
      handleClose={handleClose}
      updateStatusDemand={updateStatusDemand}
    />,
  );
  return { handleClose, updateStatusDemand };
};

const link = () => screen.getByRole("textbox", { name: "Link do YouTube" });

beforeEach(() => {
  uploadFileDemand.mockClear();
  sendVideoDemand.mockClear();
});

describe("ShowDemand — Documento ou Vídeo (049/04)", () => {
  it("abre em Documento, com a área de upload e sem campo de link", () => {
    montar();
    expect(screen.getByRole("button", { name: /Documento/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(/Clique para fazer upload/)).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Link do YouTube" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /Salvar/ })).toBeDisabled();
  });

  it("Vídeo: link inválido desabilita Salvar e mostra o erro; válido habilita e mostra o preview", () => {
    montar();
    fireEvent.click(screen.getByRole("button", { name: /Vídeo/ }));
    const salvar = screen.getByRole("button", { name: /Salvar/ });
    expect(screen.queryByText(/Clique para fazer upload/)).toBeNull();

    expect(salvar).toBeDisabled();
    fireEvent.change(link(), {
      target: { value: "https://www.youtube.com/shorts/dQw4w9WgXcQ" },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(salvar).toBeDisabled();

    fireEvent.change(link(), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });
    expect(screen.getByTestId("player")).toHaveTextContent("dQw4w9WgXcQ");
    expect(salvar).toBeEnabled();
  });

  it("Salvar em Vídeo chama sendVideoDemand com a URL e fecha", async () => {
    const { handleClose, updateStatusDemand } = montar();
    fireEvent.click(screen.getByRole("button", { name: /Vídeo/ }));
    fireEvent.change(link(), {
      target: { value: " https://youtu.be/dQw4w9WgXcQ " },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() =>
      expect(sendVideoDemand).toHaveBeenCalledWith(
        "d1",
        "https://youtu.be/dQw4w9WgXcQ",
        "tok",
      ),
    );
    await waitFor(() => expect(updateStatusDemand).toHaveBeenCalledWith("d1"));
    expect(handleClose).toHaveBeenCalled();
    expect(uploadFileDemand).not.toHaveBeenCalled();
  });

  it("voltar para Documento limpa o link", () => {
    montar();
    fireEvent.click(screen.getByRole("button", { name: /Vídeo/ }));
    fireEvent.change(link(), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Documento/ }));
    expect(screen.getByRole("button", { name: /Salvar/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Vídeo/ }));
    expect(link()).toHaveValue("");
  });
});

describe("ShowDemand — contexto da demanda (050/05)", () => {
  it("mostra quem pediu, o status 'Aguardando envio' e a descrição em texto", () => {
    montar();
    const pessoas = screen.getByRole("list", { name: "Pessoas da demanda" });
    expect(pessoas).toHaveTextContent("Pedida por");
    expect(pessoas).toHaveTextContent("Carla Mendes");
    expect(pessoas).toHaveTextContent("01/09/2026");
    expect(screen.getByText("Aguardando envio")).toBeInTheDocument();
    expect(
      screen.getByText("Material com teoria e exercícios."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /Descrição/ })).toBeNull();
  });

  it("Excluir demanda fica fora do grupo Fechar/Salvar", () => {
    montar();
    const excluir = screen.getByRole("button", { name: /Excluir demanda/ });
    const salvar = screen.getByRole("button", { name: /Salvar/ });
    expect(excluir.parentElement).not.toBe(salvar.parentElement);
  });
});
