import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalCadernoComAnuladas } from "./ModalCadernoComAnuladas";
import {
  consultaDoCaderno,
  ErroCadernoComAnuladas,
  erroDoCaderno,
} from "@/services/caderno/baixarCaderno";

const svc = vi.hoisted(() => ({ baixarCadernoDaProva: vi.fn() }));
vi.mock("@/services/caderno/baixarCadernoDaProva", () => ({
  baixarCadernoDaProva: svc.baixarCadernoDaProva,
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: vi.fn(), dismiss: vi.fn() },
}));
vi.mock("@/pages/dashProvas/modals/ModalBaixarCartao", () => ({ ModalBaixarCartao: () => null }));

import { MaterialDaProva } from "@/pages/dashProvas/modals/MaterialDaProva";
import { TEXTO_CADERNO_DA_PROVA } from "@/pages/dashProvas/modals/materialDaProva.regras";

beforeEach(() => {
  vi.clearAllMocks();
  window.URL.createObjectURL = vi.fn(() => "blob:x");
  window.URL.revokeObjectURL = vi.fn();
});

describe("caderno com anulada (042/09)", () => {
  it("o 409 CADERNO_COM_ANULADAS vira ErroCadernoComAnuladas com os números", async () => {
    const e = await erroDoCaderno(
      new Response(JSON.stringify({ code: "CADERNO_COM_ANULADAS", numeros: [45], message: "m" }), { status: 409 }),
    );
    expect(e).toBeInstanceOf(ErroCadernoComAnuladas);
    expect((e as ErroCadernoComAnuladas).numeros).toEqual([45]);
    const outro = await erroDoCaderno(new Response("<html>", { status: 502 }));
    expect(outro).not.toBeInstanceOf(ErroCadernoComAnuladas);
    expect(outro.message).toBe("Não foi possível baixar o caderno");
  });

  it("a query: só literais", () => {
    expect(consultaDoCaderno({})).toBe("");
    expect(consultaDoCaderno({ draft: true, confirmarAnuladas: true })).toBe(
      "?draft=true&confirmarAnuladas=true",
    );
  });

  it("modal com 1 e com várias", () => {
    const { rerender } = render(
      <ModalCadernoComAnuladas numeros={[45]} onConfirmar={vi.fn()} onCancelar={vi.fn()} />,
    );
    expect(screen.getByText(/Esta prova tem 1 questão anulada \(45\)\. Ela vai sair/)).toBeTruthy();
    rerender(<ModalCadernoComAnuladas numeros={[3, 45]} onConfirmar={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText(/2 questões anuladas \(3, 45\)\. Elas vão sair/)).toBeTruthy();
  });

  it("⚠️ caderno da prova: pergunta; Cancelar não gera; Gerar mesmo assim reenvia confirmado", async () => {
    svc.baixarCadernoDaProva
      .mockRejectedValueOnce(new ErroCadernoComAnuladas("m", [45]))
      .mockRejectedValueOnce(new ErroCadernoComAnuladas("m", [45]))
      .mockResolvedValueOnce({ blob: new Blob(["ZIP"]), avisos: 1 });
    render(
      <MaterialDaProva
        prova={{ _id: "p1", nome: "1º ENEM" }}
        categoria={{ dono: "Cursinho" }}
        simulados={[{ bloqueado: false }]}
        token="t"
      />,
    );
    fireEvent.click(screen.getByText(TEXTO_CADERNO_DA_PROVA));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(svc.baixarCadernoDaProva).toHaveBeenCalledTimes(1);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(TEXTO_CADERNO_DA_PROVA));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByText("Gerar mesmo assim"));
    await waitFor(() =>
      expect(svc.baixarCadernoDaProva).toHaveBeenLastCalledWith("p1", "t", true),
    );
    await waitFor(() => expect(window.URL.createObjectURL).toHaveBeenCalled());
  });
});
