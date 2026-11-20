import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// O recorte (tickets/059 D21): o Dialog do PhotoEditor abre SOBRE o do formulário, que fica aberto.
vi.mock("react-easy-crop", async () => {
  const React = await import("react");
  return {
    default: function Cropper({
      onCropComplete,
    }: {
      onCropComplete: (a: unknown, b: unknown) => void;
    }) {
      React.useEffect(() => {
        onCropComplete({}, { x: 0, y: 0, width: 10, height: 10 });
      }, [onCropComplete]);
      return <div data-testid="cropper" />;
    },
  };
});
vi.mock("@/utils/cropImage", () => ({
  default: vi.fn(async () => new File(["x"], "recorte.png", { type: "image/png" })),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

import ModalEditSupporter from "./ModalEditSupporter";

describe("ModalEditSupporter com o recorte da logo", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:logo");
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("aprovar o recorte mantém o formulário aberto e devolve o foco ao campo de arquivo", async () => {
    render(
      <ModalEditSupporter
        isOpen
        handleClose={vi.fn()}
        supporter={null}
        onCreated={vi.fn()}
        onUpdated={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Nome do apoiador"), {
      target: { value: "Instituto Alfa" },
    });
    const campo = screen.getByLabelText("Logo") as HTMLInputElement;
    campo.focus();
    fireEvent.change(campo, {
      target: { files: [new File(["img"], "logo.png", { type: "image/png" })] },
    });
    expect(
      screen.getByRole("dialog", { name: "Recortar imagem" }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Aprovar foto" }));
    });

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Recortar imagem" })).toBeNull(),
    );
    expect(screen.getByPlaceholderText("Nome do apoiador")).toHaveValue("Instituto Alfa");
    await waitFor(() => expect(document.activeElement).toBe(campo));
  });
});
