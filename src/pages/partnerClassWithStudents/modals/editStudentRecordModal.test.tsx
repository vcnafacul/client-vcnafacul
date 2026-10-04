import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const toastMock = vi.hoisted(() => ({ warning: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: toastMock }));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { EditStudentRecordModal } from "./editStudentRecordModal";

const abrir = (currentPresent: boolean, currentJustification?: string) => {
  const handleConfirm = vi.fn();
  const handleClose = vi.fn();
  render(
    <EditStudentRecordModal
      isOpen
      handleClose={handleClose}
      currentPresent={currentPresent}
      currentJustification={currentJustification}
      handleConfirm={handleConfirm}
    />,
  );
  const campo = (id: string) =>
    document.getElementById(id) as HTMLInputElement | null;
  const digitar = (id: string, valor: string) =>
    fireEvent.change(campo(id)!, { target: { value: valor } });
  const confirmar = () =>
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
  const alternar = () => fireEvent.click(screen.getByRole("checkbox"));
  return { handleConfirm, handleClose, campo, digitar, confirmar, alternar };
};

describe("EditStudentRecordModal — observação x justificativa (05)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sem observação não confirma", () => {
    const { handleConfirm, confirmar, digitar } = abrir(true);
    confirmar();
    digitar("observation", "   ");
    confirmar();
    expect(handleConfirm).not.toHaveBeenCalled();
    expect(toastMock.warning).toHaveBeenCalledWith(
      "Por favor, informe uma observação!",
      expect.anything(),
    );
  });

  it("⚠️ Presente → Ausente só com observação: falta comum (justificativa vazia)", () => {
    const { handleConfirm, alternar, digitar, confirmar } = abrir(true);
    alternar();
    digitar("observation", " corrigindo chamada ");
    confirmar();
    expect(handleConfirm).toHaveBeenCalledWith({
      present: false,
      observation: "corrigindo chamada",
      justification: "",
    });
  });

  it("Ausente com justificativa: falta justificada", () => {
    const { handleConfirm, digitar, confirmar } = abrir(false);
    digitar("observation", "trouxe atestado");
    digitar("justification", "Atestado médico");
    confirmar();
    expect(handleConfirm).toHaveBeenCalledWith({
      present: false,
      observation: "trouxe atestado",
      justification: "Atestado médico",
    });
  });

  it("a justificativa atual vem preenchida; apagar remove", () => {
    const { handleConfirm, campo, digitar, confirmar } = abrir(
      false,
      "Atestado",
    );
    expect(campo("justification")!.value).toBe("Atestado");
    digitar("observation", "justificada por engano");
    digitar("justification", "");
    confirmar();
    expect(handleConfirm).toHaveBeenCalledWith({
      present: false,
      observation: "justificada por engano",
      justification: "",
    });
  });

  it("Presente: sem campo de justificativa, e ela não vai", () => {
    const { handleConfirm, campo, alternar, digitar, confirmar } = abrir(
      false,
      "Atestado",
    );
    alternar();
    expect(campo("justification")).toBeNull();
    digitar("observation", "estava presente");
    confirmar();
    expect(handleConfirm).toHaveBeenCalledWith({
      present: true,
      observation: "estava presente",
    });
  });
});
