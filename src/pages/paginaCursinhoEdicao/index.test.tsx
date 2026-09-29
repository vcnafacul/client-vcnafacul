import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getMinhaPagina: vi.fn(),
  salvarMinhaPagina: vi.fn(),
}));
vi.mock("@/services/paginaCursinho", () => svc);
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tk" } }),
}));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

/** Dublê do TipTap (não roda bem no jsdom): expõe o texto e o que recebe. */
const editorProps = vi.hoisted(() => ({ ultimo: {} as Record<string, unknown> }));
vi.mock("@/components/molecules/richTextEditor/RichTextEditor", () => ({
  RichTextEditor: (p: { content: string; onChange: (v: string) => void }) => {
    editorProps.ultimo = p;
    return (
      <textarea
        aria-label="Quem somos"
        value={p.content}
        onChange={(e) => p.onChange(e.target.value)}
      />
    );
  },
}));

import PaginaCursinhoEdicao from ".";

const pagina = (over = {}) => ({
  slug: "cursinho-sao-joao",
  quemSomos: null,
  active: false,
  nomeDoCursinho: "Cursinho São João",
  linksPublicos: [],
  linksInternos: [],
  ...over,
});

const montar = async (p = pagina()) => {
  svc.getMinhaPagina.mockResolvedValue(p);
  const { container } = render(<PaginaCursinhoEdicao />);
  await screen.findByText("Página do cursinho");
  return container.querySelector("form")!;
};

describe("Página do cursinho — edição (025 · 06)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carrega a página e o nome do cursinho", async () => {
    await montar();
    expect(screen.getByText("Cursinho São João")).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço da página")).toHaveValue("cursinho-sao-joao");
    expect(screen.getByText("Página desativada")).toBeInTheDocument();
  });

  it("normaliza o endereço enquanto digita", async () => {
    await montar();
    const campo = screen.getByLabelText("Endereço da página");
    fireEvent.change(campo, { target: { value: "Pré Vestibular " } });
    expect(campo).toHaveValue("pre-vestibular-");
  });

  it("⚠️ o editor do Quem somos não recebe upload de imagem", async () => {
    await montar();
    expect(editorProps.ultimo.onImageUpload).toBeUndefined();
  });

  it("ativar sem Quem somos: avisa e não salva", async () => {
    const form = await montar();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("alert")).toHaveTextContent("preencha o Quem somos");
    fireEvent.submit(form);
    expect(svc.salvarMinhaPagina).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Para ativar a página, preencha o Quem somos.");
  });

  it("salva com o slug final, o texto e os links", async () => {
    svc.salvarMinhaPagina.mockImplementation(async (_t, p) => ({
      ...p,
      nomeDoCursinho: "Cursinho São João",
    }));
    const form = await montar();
    fireEvent.change(screen.getByLabelText("Endereço da página"), {
      target: { value: "meu-cursinho-" },
    });
    fireEvent.change(screen.getByLabelText("Quem somos"), {
      target: { value: "Somos um cursinho popular." },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getAllByRole("button", { name: /Adicionar link/ })[0]);
    fireEvent.change(screen.getByLabelText("Links úteis: título do link 1"), {
      target: { value: "Site" },
    });
    fireEvent.change(screen.getByLabelText("Links úteis: endereço do link 1"), {
      target: { value: "https://site.org" },
    });
    fireEvent.submit(form);

    await waitFor(() => expect(svc.salvarMinhaPagina).toHaveBeenCalled());
    expect(svc.salvarMinhaPagina).toHaveBeenCalledWith("tk", {
      slug: "meu-cursinho",
      quemSomos: "Somos um cursinho popular.",
      active: true,
      linksPublicos: [{ titulo: "Site", url: "https://site.org" }],
      linksInternos: [],
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Página salva"));
    expect(screen.getByRole("link", { name: /Ver página pública/ })).toHaveAttribute(
      "href",
      `${window.location.origin}/cursinho/meu-cursinho`,
    );
  });

  it("409 da api vira toast e o que foi digitado fica", async () => {
    svc.salvarMinhaPagina.mockRejectedValue(
      new Error("Este endereço já está em uso por outro cursinho."),
    );
    const form = await montar();
    fireEvent.change(screen.getByLabelText("Endereço da página"), {
      target: { value: "ocupado" },
    });
    fireEvent.submit(form);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Este endereço já está em uso por outro cursinho.",
      ),
    );
    expect(screen.getByLabelText("Endereço da página")).toHaveValue("ocupado");
  });

  it("remove um link", async () => {
    await montar(pagina({ linksInternos: [{ titulo: "Drive", url: "https://d" }] }));
    fireEvent.click(screen.getByRole("button", { name: "Links úteis internos: remover link 1" }));
    expect(screen.queryByLabelText("Links úteis internos: título do link 1")).toBeNull();
  });
});
