import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "./alert";
import { Progress } from "./progress";
import { Spinner } from "./spinner";

describe("Alert", () => {
  it("destructive é role=alert, com título, mensagem e ação", () => {
    render(
      <Alert variant="destructive" title="Falhou" action={<button>Tentar de novo</button>}>
        Verifique sua conexão.
      </Alert>,
    );
    const alerta = screen.getByRole("alert");
    expect(alerta.className).toContain("bg-destructive-muted");
    expect(screen.getByText("Falhou").className).toContain("text-destructive");
    expect(screen.getByText("Verifique sua conexão.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
  });

  it("info é role=status", () => {
    render(<Alert title="Aviso" />);
    expect(screen.getByRole("status")).toBeTruthy();
  });
});

describe("Spinner", () => {
  it("tem role=status e nome 'Carregando'", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Carregando" })).toBeTruthy();
  });

  it("decorativo fica escondido do leitor de tela", () => {
    const { container } = render(<Spinner decorative />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("page tem 32px", () => {
    const { container } = render(<Spinner size="page" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("size-8");
  });
});

describe("Progress", () => {
  it("expõe progressbar com o valor", () => {
    render(<Progress value={40} aria-label="Envio" />);
    expect(screen.getByRole("progressbar", { name: "Envio" }).getAttribute("aria-valuenow")).toBe("40");
  });
});
