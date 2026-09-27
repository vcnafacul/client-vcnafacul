import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TypeProblem } from "@/enums/audit/typeProblem";
import { useAuthStore } from "@/store/auth";

const api = vi.hoisted(() => ({ reportMapHome: vi.fn(async () => undefined) }));
vi.mock("@/services/geolocation/reportMapHome", () => api);
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ReportLC from "./report";

describe("ReportLC", () => {
  it("⚠️ as opções aparecem sem aspas literais", () => {
    render(
      <ReportLC
        isOpen
        entityId="g1"
        entityName="Cursinho X"
        type={TypeProblem.GEO}
        handleClose={() => {}}
      />,
    );
    expect(screen.getByText("Sim")).toBeInTheDocument();
    expect(
      screen.getByText("Não, foi um problema na plataforma"),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('"Sim"');
  });

  it("⚠️ deslogado envia (sem e-mail) e a mensagem não tem mais o erro de digitação", async () => {
    useAuthStore.getState().logout();
    const fechar = vi.fn();
    render(
      <ReportLC
        isOpen
        entityId="g1"
        entityName="Cursinho X"
        type={TypeProblem.GEO}
        handleClose={fechar}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Mudou de endereço" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => expect(fechar).toHaveBeenCalled());
    expect(api.reportMapHome).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: "g1",
        updatedBy: "",
        message: "Mudou de endereço - Problema encontrado em Cursinho",
      }),
    );
  });
});
