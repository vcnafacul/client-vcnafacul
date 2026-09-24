import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BaixarFotoDoCartao } from "./BaixarFotoDoCartao";
import { nomeDaFoto } from "./nomeDaFoto";

const baixarFotoDoCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/cartaoResposta/baixarFotoDoCartao", () => ({
  baixarFotoDoCartao,
}));
const toast = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

// ⚠️ jsdom não implementa `createObjectURL` nem download de verdade.
const criado = vi.fn(() => "blob:fake");
const revogado = vi.fn();
let baixados: string[] = [];

describe("BaixarFotoDoCartao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    baixados = [];
    Object.assign(window.URL, {
      createObjectURL: criado,
      revokeObjectURL: revogado,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      baixados.push(this.download);
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const montar = () =>
    render(
      <BaixarFotoDoCartao token="tok" historicoId="h1" matricula="2025001" />,
    );

  it("baixa o arquivo com o nome pela matrícula", async () => {
    baixarFotoDoCartao.mockResolvedValue(
      new Blob(["x"], { type: "image/jpeg" }),
    );
    montar();

    fireEvent.click(screen.getByText("Baixar cartão"));

    await waitFor(() => expect(baixados).toEqual(["cartao-2025001.jpg"]));
    expect(baixarFotoDoCartao).toHaveBeenCalledWith("tok", "h1");
    expect(revogado).toHaveBeenCalledWith("blob:fake");
  });

  it("recusa vira toast com o motivo, e o botão volta", async () => {
    baixarFotoDoCartao.mockRejectedValue(
      new Error("Não há foto do cartão para este estudante."),
    );
    montar();

    fireEvent.click(screen.getByText("Baixar cartão"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Não há foto do cartão para este estudante.",
      ),
    );
    expect(screen.getByText("Baixar cartão")).toBeTruthy();
    expect(baixados).toEqual([]);
  });
});

describe("nomeDaFoto", () => {
  it("extensão pelo tipo, e a matrícula limpa", () => {
    expect(nomeDaFoto("2025001", "image/png")).toBe("cartao-2025001.png");
    expect(nomeDaFoto("2025 / 01", "image/jpeg")).toBe("cartao-2025_01.jpg");
    expect(nomeDaFoto("", "")).toBe("cartao-estudante.jpg");
  });
});
