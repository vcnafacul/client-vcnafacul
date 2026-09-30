import { TooltipProvider } from "@/components/ui/tooltip";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AcaoIcone from "./AcaoIcone";

const info = vi.fn();
vi.mock("react-toastify", () => ({
  toast: { info: (...a: unknown[]) => info(...a) },
}));

const Icone = () => <svg />;

describe("AcaoIcone — motivo no toque", () => {
  it("clicar desabilitado mostra o motivo e não executa", () => {
    const onClick = vi.fn();
    render(
      <TooltipProvider>
        <AcaoIcone
          icone={Icone}
          rotulo="Ver relatório"
          onClick={onClick}
          desabilitado
          motivoDesabilitado="Nenhum cartão enviado"
        />
      </TooltipProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Nenhum cartão enviado" }),
    );
    expect(info).toHaveBeenCalledWith(
      "Nenhum cartão enviado",
      expect.anything(),
    );
    expect(onClick).not.toHaveBeenCalled();
  });

  it("habilitado executa sem toast", () => {
    info.mockClear();
    const onClick = vi.fn();
    render(
      <TooltipProvider>
        <AcaoIcone icone={Icone} rotulo="Ver relatório" onClick={onClick} />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ver relatório" }));
    expect(onClick).toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });
});
