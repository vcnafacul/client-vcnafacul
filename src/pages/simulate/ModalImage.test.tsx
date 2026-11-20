import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ModalImage from "@/components/atoms/modalImage";

describe("ModalImage", () => {
  it("abre um Dialog com título para leitor de tela e a imagem com alt; Fechar chama handleClose", () => {
    const fechar = vi.fn();
    render(<ModalImage image="/q.png" isOpen handleClose={fechar} />);

    expect(screen.getByRole("dialog", { name: "Imagem ampliada" })).toBeInTheDocument();
    expect(screen.getByAltText("Imagem ampliada")).toHaveAttribute("src", "/q.png");
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(fechar).toHaveBeenCalled();
  });

  it("fechado, não renderiza nada", () => {
    render(<ModalImage image="/q.png" isOpen={false} handleClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
