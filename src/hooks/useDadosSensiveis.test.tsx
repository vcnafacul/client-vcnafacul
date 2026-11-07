import { ToggleDadosSensiveis } from "@/components/molecules/toggleDadosSensiveis";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDadosSensiveis } from "./useDadosSensiveis";

function Tela({ podeVerCompleto }: { podeVerCompleto: boolean }) {
  const { mostrarToggle, ocultar, setOcultar, mascarar } =
    useDadosSensiveis(podeVerCompleto);
  return (
    <>
      {mostrarToggle && (
        <ToggleDadosSensiveis ocultar={ocultar} onChange={setOcultar} />
      )}
      <p>{mascarar.cpf("123.456.789-01")}</p>
      <p>{mascarar.email("fernando@gmail.com")}</p>
    </>
  );
}

describe("useDadosSensiveis", () => {
  it("com permissão: abre oculto, com o toggle ligado", () => {
    render(<Tela podeVerCompleto />);
    expect(
      screen.getByRole("checkbox", { name: /Ocultar dados sensíveis/ }),
    ).toBeChecked();
    expect(screen.getByText("***.***.789-01")).toBeInTheDocument();
    expect(screen.getByText("f******o@gmail.com")).toBeInTheDocument();
  });

  it("desligar o toggle mostra o dado completo, e ligar oculta de novo", () => {
    render(<Tela podeVerCompleto />);
    const toggle = screen.getByRole("checkbox", {
      name: /Ocultar dados sensíveis/,
    });
    fireEvent.click(toggle);
    expect(screen.getByText("123.456.789-01")).toBeInTheDocument();
    expect(screen.getByText("fernando@gmail.com")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(screen.getByText("***.***.789-01")).toBeInTheDocument();
  });

  it("sem permissão: sem toggle e nada aparece completo", () => {
    render(<Tela podeVerCompleto={false} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("***.***.789-01")).toBeInTheDocument();
  });

  it("⚠️ não guarda a escolha: montar de novo volta oculto", () => {
    const { unmount } = render(<Tela podeVerCompleto />);
    fireEvent.click(screen.getByRole("checkbox"));
    unmount();
    render(<Tela podeVerCompleto />);
    expect(screen.getByText("***.***.789-01")).toBeInTheDocument();
  });
});
