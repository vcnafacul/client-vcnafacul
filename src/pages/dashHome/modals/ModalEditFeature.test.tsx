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

import ModalEditFeature from "./ModalEditFeature";

const montar = () =>
  render(
    <ModalEditFeature
      isOpen
      handleClose={vi.fn()}
      feature={null}
      onCreated={vi.fn()}
      onUpdated={vi.fn()}
    />,
  );

// Escolhe o arquivo como o navegador: o campo já está com o foco quando o `change` chega.
const escolherImagem = () => {
  const campo = screen.getByLabelText("Imagem") as HTMLInputElement;
  campo.focus();
  fireEvent.change(campo, {
    target: { files: [new File(["img"], "foto.png", { type: "image/png" })] },
  });
  return campo;
};

describe("ModalEditFeature com o recorte da imagem", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it("o formulário continua aberto com o texto digitado, e o recorte abre por cima", () => {
    montar();
    fireEvent.change(screen.getByPlaceholderText("Título do item"), {
      target: { value: "Aulas ao vivo" },
    });
    escolherImagem();

    expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);
    expect(screen.getByRole("dialog", { name: "Recortar imagem" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do item", { exact: true })).toHaveValue(
      "Aulas ao vivo",
    );
  });

  it("aprovar o recorte fecha só o recorte, guarda o texto e devolve o foco ao campo de arquivo", async () => {
    montar();
    fireEvent.change(screen.getByPlaceholderText("Título do item"), {
      target: { value: "Aulas ao vivo" },
    });
    const campo = escolherImagem();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Aprovar foto" }));
    });

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Recortar imagem" })).toBeNull(),
    );
    expect(screen.getByRole("dialog", { name: "Adicionar item" })).toBeInTheDocument();
    expect(screen.getByText("Imagem recortada pronta para upload.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do item")).toHaveValue("Aulas ao vivo");
    await waitFor(() => expect(document.activeElement).toBe(campo));
  });

  it("cancelar o recorte também devolve o foco ao campo de arquivo, sem imagem", async () => {
    montar();
    const campo = escolherImagem();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar", hidden: false }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Recortar imagem" })).toBeNull(),
    );
    expect(screen.queryByText("Imagem recortada pronta para upload.")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Adicionar item" })).toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toBe(campo));
  });

  it("Esc com o recorte aberto fecha só o recorte; o formulário continua aberto", async () => {
    montar();
    escolherImagem();
    expect(screen.getByRole("dialog", { name: "Recortar imagem" })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog", { name: "Recortar imagem" }), {
      key: "Escape",
      code: "Escape",
    });

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Recortar imagem" })).toBeNull(),
    );
    expect(screen.getByRole("dialog", { name: "Adicionar item" })).toBeInTheDocument();
  });
});
