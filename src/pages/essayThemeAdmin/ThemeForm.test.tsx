import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  uploadEssayThemeAsset: vi.fn(),
  getEssayThemeAssetImage: vi.fn(),
}));
vi.mock("@/services/essay/themeAssets", () => svc);
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tk" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

/**
 * O editor real (TipTap) não roda bem no jsdom; este dublê expõe só o que o
 * formulário liga nele: o texto e o `onImageUpload`.
 */
vi.mock("@/components/molecules/richTextEditor/RichTextEditor", () => ({
  RichTextEditor: (p: {
    content: string;
    onChange: (v: string) => void;
    onImageUpload?: (f: File) => Promise<string>;
    fetchAsset?: unknown;
  }) => (
    <div>
      <textarea
        aria-label="texto motivador"
        value={p.content}
        onChange={(e) => p.onChange(e.target.value)}
      />
      <span data-testid="fetch-asset">{String(!!p.fetchAsset)}</span>
      <button
        type="button"
        onClick={async () => {
          const ref = await p.onImageUpload!(
            new File(["x"], "g.png", { type: "image/png" }),
          );
          p.onChange(`${p.content} ![](${ref})`);
        }}
      >
        inserir imagem
      </button>
    </div>
  ),
}));

import ThemeForm from "./ThemeForm";


describe("ThemeForm — imagens do texto motivador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:x");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  const montar = (onSave = vi.fn()) => {
    const { container } = render(
      <ThemeForm
        initial={
          {
            title: "Tema",
            motivationalText: "Texto",
            instruction: "",
            weekStart: "2026-10-01",
            weekEnd: "2026-10-07",
          } as never
        }
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    return { onSave, form: container.querySelector("form")! };
  };

  it("liga o editor às imagens do tema", () => {
    montar();
    expect(screen.getByTestId("fetch-asset")).toHaveTextContent("true");
  });

  it("⚠️ a imagem só sobe no Salvar, e o texto salvo leva o asset:// real", async () => {
    svc.uploadEssayThemeAsset.mockResolvedValue("asset://abc.png");
    const { onSave, form } = montar();

    fireEvent.click(screen.getByRole("button", { name: "inserir imagem" }));
    await waitFor(() =>
      expect(
        (screen.getByLabelText("texto motivador") as HTMLTextAreaElement).value,
      ).toContain("pending-asset://"),
    );
    expect(svc.uploadEssayThemeAsset).not.toHaveBeenCalled();

    fireEvent.submit(form);

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(svc.uploadEssayThemeAsset).toHaveBeenCalledTimes(1);
    expect(svc.uploadEssayThemeAsset.mock.calls[0][1]).toBe("tk");
    const salvo = onSave.mock.calls[0][0].motivationalText;
    expect(salvo).toContain("asset://abc.png");
    expect(salvo).not.toContain("pending-asset://");
  });

  it("se o upload falha, não salva o tema", async () => {
    svc.uploadEssayThemeAsset.mockRejectedValue(new Error("A imagem deve ter no máximo 5MB"));
    const { onSave, form } = montar();

    fireEvent.click(screen.getByRole("button", { name: "inserir imagem" }));
    await waitFor(() =>
      expect(
        (screen.getByLabelText("texto motivador") as HTMLTextAreaElement).value,
      ).toContain("pending-asset://"),
    );
    fireEvent.submit(form);

    const { toast } = await import("react-toastify");
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("A imagem deve ter no máximo 5MB"),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("sem imagem, salva como antes, sem upload", async () => {
    const { onSave, form } = montar();
    fireEvent.submit(form);
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].motivationalText).toBe("Texto");
    expect(svc.uploadEssayThemeAsset).not.toHaveBeenCalled();
  });
});
