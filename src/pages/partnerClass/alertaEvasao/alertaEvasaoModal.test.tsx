import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({ get: vi.fn(), salvar: vi.fn() }));
vi.mock("@/services/prepCourse/alertaEvasao", () => ({
  getAlertaEvasao: svc.get,
  salvarAlertaEvasao: svc.salvar,
}));
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    loading: vi.fn(() => "id"),
    update: vi.fn(),
    dismiss: vi.fn(),
  },
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { AlertaEvasaoModal } from "./alertaEvasaoModal";
import { validarAlerta } from "./validarAlerta";

describe("validarAlerta", () => {
  it.each([
    ["", "10", {}],
    ["15", "10", {}],
    ["1", "1", {}],
    ["100", "200", {}],
  ])("aceita %s%% / %s aulas", (p, m, esperado) =>
    expect(validarAlerta(p, m)).toEqual(esperado),
  );
  it.each([
    ["0", "10", "percentual"],
    ["101", "10", "percentual"],
    ["2.5", "10", "percentual"],
    ["abc", "10", "percentual"],
    ["15", "0", "minimo"],
    ["15", "", "minimo"],
    ["15", "201", "minimo"],
  ])("recusa %s%% / %s aulas (%s)", (p, m, campo) =>
    expect(Object.keys(validarAlerta(p, m))).toEqual([campo]),
  );
});

describe("AlertaEvasaoModal (tickets/054, card 03)", () => {
  beforeEach(() => vi.clearAllMocks());

  const percentual = () =>
    screen.getByRole("textbox", { name: "Percentual de faltas" });
  const minimo = () => screen.getByRole("textbox", { name: "Mínimo de aulas" });

  it("abre com o que está salvo e mostra o exemplo", async () => {
    svc.get.mockResolvedValue({ percentual: 15, minimoDeAulas: 10 });
    render(<AlertaEvasaoModal isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(percentual()).toHaveValue("15"));
    expect(minimo()).toHaveValue("10");
    expect(screen.getByText(/2 faltas sem justificativa em 10 aulas \(20%\)/)).toBeInTheDocument();
  });

  it("nunca configurado: % vazio e aviso de desligado", async () => {
    svc.get.mockResolvedValue({ percentual: null, minimoDeAulas: 10 });
    render(<AlertaEvasaoModal isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(minimo()).toHaveValue("10"));
    expect(percentual()).toHaveValue("");
    expect(screen.getByText(/Alerta desligado/)).toBeInTheDocument();
  });

  it("salvar manda os números; vazio manda null", async () => {
    svc.get.mockResolvedValue({ percentual: null, minimoDeAulas: 10 });
    svc.salvar.mockResolvedValue({});
    const fechar = vi.fn();
    render(<AlertaEvasaoModal isOpen handleClose={fechar} />);
    await waitFor(() => expect(percentual()).toBeEnabled());

    fireEvent.change(percentual(), { target: { value: "20" } });
    fireEvent.change(minimo(), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(svc.salvar).toHaveBeenCalledWith("tok", {
        percentual: 20,
        minimoDeAulas: 12,
      }),
    );
    await waitFor(() => expect(fechar).toHaveBeenCalled());

    fireEvent.change(percentual(), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() =>
      expect(svc.salvar).toHaveBeenLastCalledWith("tok", {
        percentual: null,
        minimoDeAulas: 12,
      }),
    );
  });

  it("⚠️ valor inválido não chama a api e mostra o erro", async () => {
    svc.get.mockResolvedValue({ percentual: 15, minimoDeAulas: 10 });
    render(<AlertaEvasaoModal isOpen handleClose={vi.fn()} />);
    await waitFor(() => expect(percentual()).toHaveValue("15"));
    fireEvent.change(percentual(), { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText("Use um número inteiro de 1 a 100.")).toBeInTheDocument();
    expect(svc.salvar).not.toHaveBeenCalled();
  });
});
