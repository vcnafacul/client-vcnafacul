import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ExcluirEnvioDoCartao,
  TEXTO_ENVIO_EXCLUIDO,
  TEXTO_EXCLUIR_ENVIO,
} from "./ExcluirEnvioDoCartao";

const excluirEnvioDoCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/cartaoResposta/excluirEnvioDoCartao", () => ({
  excluirEnvioDoCartao,
}));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

describe("ExcluirEnvioDoCartao (card 36)", () => {
  beforeEach(() => vi.clearAllMocks());

  const montar = (onExcluido = vi.fn()) => {
    render(
      <ExcluirEnvioDoCartao
        token="tok"
        historicoId="h1"
        nome="Ana Souza"
        matricula="2025001"
        onExcluido={onExcluido}
      />,
    );
    return onExcluido;
  };

  it("⚠️ só exclui depois de confirmar, dizendo de quem é o cartão", async () => {
    excluirEnvioDoCartao.mockResolvedValue(undefined);
    const onExcluido = montar();

    fireEvent.click(screen.getByText(TEXTO_EXCLUIR_ENVIO));
    expect(excluirEnvioDoCartao).not.toHaveBeenCalled();
    expect(screen.getByText(/Ana Souza \(2025001\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() => expect(onExcluido).toHaveBeenCalled());
    expect(excluirEnvioDoCartao).toHaveBeenCalledWith("tok", "h1");
    expect(toast.success).toHaveBeenCalledWith(TEXTO_ENVIO_EXCLUIDO);
  });

  it("recusa do servidor: mostra o motivo e NÃO avisa a tela", async () => {
    excluirEnvioDoCartao.mockRejectedValue(
      new Error("Aguarde terminar para excluir."),
    );
    const onExcluido = montar();

    fireEvent.click(screen.getByText(TEXTO_EXCLUIR_ENVIO));
    fireEvent.click(screen.getByText("Confirmar"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Aguarde terminar para excluir.",
      ),
    );
    expect(onExcluido).not.toHaveBeenCalled();
  });
});
