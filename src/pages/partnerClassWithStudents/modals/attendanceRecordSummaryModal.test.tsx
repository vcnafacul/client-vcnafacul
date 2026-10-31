import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const alerta = vi.hoisted(() => vi.fn());
vi.mock("@/services/prepCourse/alertaEvasao", () => ({
  getAlertaEvasao: alerta,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import AttendanceRecordSummaryModal from "./attendanceRecordSummaryModal";

describe("Relatório com o % do alerta (tickets/054, card 05)", () => {
  beforeEach(() => vi.clearAllMocks());

  const abrirExcel = () => {
    render(
      <AttendanceRecordSummaryModal isOpen handleClose={vi.fn()} classId="c1" />,
    );
    fireEvent.click(screen.getByLabelText("Relatório Excel (Detalhado)"));
  };

  it("com alerta configurado, o limite abre preenchido e diz de onde veio", async () => {
    alerta.mockResolvedValue({ percentual: 15, minimoDeAulas: 10 });
    abrirExcel();
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(15));
    expect(screen.getByText(/Padrão do cursinho: 15%/)).toBeInTheDocument();
  });

  it("sem alerta, o campo fica vazio como antes", async () => {
    alerta.mockResolvedValue({ percentual: null, minimoDeAulas: 10 });
    abrirExcel();
    await waitFor(() => expect(alerta).toHaveBeenCalled());
    expect(screen.getByRole("spinbutton")).toHaveValue(null);
    expect(screen.queryByText(/Padrão do cursinho/)).toBeNull();
  });
});
