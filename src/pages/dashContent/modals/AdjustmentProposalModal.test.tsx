import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdjustmentProposalModal from "./AdjustmentProposalModal";

const createProposal = vi.hoisted(() => vi.fn(async () => ({})));
vi.mock("@/services/content/adjustmentProposal", () => ({ createProposal }));
vi.mock("@/components/atoms/docxPreview", () => ({ default: () => null }));
vi.mock("@/components/atoms/youtubePlayer", () => ({
  YoutubePlayer: ({ videoId }: { videoId: string }) => <div data-testid="player">{videoId}</div>,
}));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(), update: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/store/auth", () => ({ useAuthStore: () => ({ data: { token: "tok" } }) }));

beforeEach(() => createProposal.mockClear());

describe("AdjustmentProposalModal — proposta em vídeo (049/04)", () => {
  it("Vídeo com link válido envia FormData com url e comment, sem file", async () => {
    const onSuccess = vi.fn();
    render(<AdjustmentProposalModal contentId="c1" isOpen handleClose={vi.fn()} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: /Vídeo/ }));
    const enviar = screen.getByRole("button", { name: "Enviar Proposta" });
    expect(enviar).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: "Link do YouTube" }), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Comentário sobre o ajuste/), {
      target: { value: "troca" },
    });
    expect(enviar).toBeEnabled();
    fireEvent.click(enviar);

    await waitFor(() => expect(createProposal).toHaveBeenCalled());
    const form = createProposal.mock.calls[0][1] as FormData;
    expect(form.get("url")).toBe("https://youtu.be/dQw4w9WgXcQ");
    expect(form.get("comment")).toBe("troca");
    expect(form.get("file")).toBeNull();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("abre em Documento, com a área de upload; Enviar desabilitado sem arquivo", () => {
    render(<AdjustmentProposalModal contentId="c1" isOpen handleClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText(/Clique para fazer upload/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar Proposta" })).toBeDisabled();
  });
});
