import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  baixarCartaoDaProva: vi.fn(async () => new Blob(["PDF"])),
  baixarCadernoDaProva: vi.fn(async () => ({
    blob: new Blob(["ZIP"]),
    avisos: 0,
  })),
}));
vi.mock("@/services/cartaoResposta/baixarCartaoDaProva", () => ({
  baixarCartaoDaProva: svc.baixarCartaoDaProva,
}));
vi.mock("@/services/caderno/baixarCadernoDaProva", () => ({
  baixarCadernoDaProva: svc.baixarCadernoDaProva,
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: vi.fn() },
}));
/*
  ⚠️ O modal real (AlertDialog do Radix) é testado no arquivo dele; aqui um dublê. Montar o
  Radix no jsdom custa segundos de CPU por teste e desestabiliza os vizinhos.
*/
vi.mock("./ModalBaixarCartao", () => ({
  ModalBaixarCartao: ({ onBaixar }: { onBaixar: () => void }) => (
    <button onClick={onBaixar}>confirmar-orientacoes</button>
  ),
}));

import { MaterialDaProva } from "./MaterialDaProva";
import {
  MOTIVO_SIMULADOS_INCOMPLETOS,
  motivoMaterialDaProva,
  TEXTO_CADERNO_DA_PROVA,
  TEXTO_CARTAO_DA_PROVA,
} from "./materialDaProva.regras";

const PROVA = { _id: "p1", nome: "1º ENEM" };
const ENEM = { dono: "Cursinho" };

beforeEach(() => {
  vi.clearAllMocks();
  window.URL.createObjectURL = vi.fn(() => "blob:x");
  window.URL.revokeObjectURL = vi.fn();
});

describe("motivoMaterialDaProva (tickets/038 · 11)", () => {
  it("todos prontos → pode; algum incompleto, nenhum ou carregando → motivo", () => {
    expect(
      motivoMaterialDaProva([{ bloqueado: false }, { bloqueado: false }]),
    ).toBeUndefined();
    expect(
      motivoMaterialDaProva([{ bloqueado: false }, { bloqueado: true }]),
    ).toBe(MOTIVO_SIMULADOS_INCOMPLETOS);
    expect(motivoMaterialDaProva([])).toBe(MOTIVO_SIMULADOS_INCOMPLETOS);
    expect(motivoMaterialDaProva(undefined)).toBe(MOTIVO_SIMULADOS_INCOMPLETOS);
  });
});

describe("MaterialDaProva (tickets/038 · 11)", () => {
  it("fora das categorias Enem do cursinho, não aparece", () => {
    const { container } = render(
      <MaterialDaProva
        prova={PROVA}
        categoria={{ dono: "cur-1" }}
        simulados={[{ bloqueado: false }]}
        token="t"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("simulado incompleto: os dois desabilitados, com o motivo", () => {
    render(
      <MaterialDaProva
        prova={PROVA}
        categoria={ENEM}
        simulados={[{ bloqueado: false }, { bloqueado: true }]}
        token="t"
      />,
    );
    for (const id of ["cartao-da-prova", "caderno-da-prova"]) {
      const botao = screen.getByTestId(id);
      expect(botao).toBeDisabled();
      expect(botao.parentElement).toHaveAttribute(
        "title",
        MOTIVO_SIMULADOS_INCOMPLETOS,
      );
    }
  });

  it("⚠️ cartão: primeiro as orientações, e só então baixa", async () => {
    render(
      <MaterialDaProva
        prova={PROVA}
        categoria={ENEM}
        simulados={[{ bloqueado: false }, { bloqueado: false }]}
        token="t"
      />,
    );
    fireEvent.click(screen.getByText(TEXTO_CARTAO_DA_PROVA));
    expect(svc.baixarCartaoDaProva).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("confirmar-orientacoes"));
    await waitFor(() =>
      expect(svc.baixarCartaoDaProva).toHaveBeenCalledWith("p1", "t"),
    );
  });

  it("caderno: baixa direto", async () => {
    render(
      <MaterialDaProva
        prova={PROVA}
        categoria={ENEM}
        simulados={[{ bloqueado: false }]}
        token="t"
      />,
    );
    fireEvent.click(screen.getByText(TEXTO_CADERNO_DA_PROVA));
    await waitFor(() =>
      expect(svc.baixarCadernoDaProva).toHaveBeenCalledWith("p1", "t"),
    );
  });
});
