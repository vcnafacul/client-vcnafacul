import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AboutVideoModal } from "./AboutVideoModal";

vi.mock("react-youtube", () => ({
  default: ({ videoId }: { videoId: string }) => <div data-testid="youtube">{videoId}</div>,
}));

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <AboutVideoModal
      videoId="abc123"
      open={open}
      onOpenChange={setOpen}
      trigger={<button type="button">Abrir vídeo</button>}
    />
  );
}

describe("AboutVideoModal", () => {
  it("abre num diálogo com nome acessível, toca o vídeo e fecha pelo botão Fechar", async () => {
    render(<Harness />);
    expect(screen.queryByTestId("youtube")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Abrir vídeo" }));
    const dialogo = await screen.findByRole("dialog", { name: "Assistir vídeo: conheça vcnafacul" });
    expect(dialogo).toBeInTheDocument();
    expect(screen.getByTestId("youtube")).toHaveTextContent("abc123");

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("youtube")).toBeNull();
  });
});
