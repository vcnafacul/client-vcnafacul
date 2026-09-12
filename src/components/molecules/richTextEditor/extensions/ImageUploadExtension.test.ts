import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ImageUploadExtension } from "./ImageUploadExtension";
import { RICH_TEXT_IMAGE_MAX_WIDTH } from "@/utils/richTextImage";

const ASSET_KEY = "assets/990cdfb0-06c6-48a6-ae84-451fde0184a3.png";

let editor: Editor | undefined;

beforeAll(() => {
  // O ResizableNodeView do @tiptap/core observa o elemento; jsdom não traz a API.
  if (!("ResizeObserver" in globalThis)) {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  }
});

afterEach(() => {
  editor?.destroy();
  editor = undefined;
});

function montarEditor(
  resolveAssetUrl?: (assetId: string) => Promise<string | undefined>
) {
  const element = document.createElement("div");
  document.body.appendChild(element);

  editor = new Editor({
    element,
    extensions: [
      StarterKit,
      ImageUploadExtension.configure({
        onUpload: async () => "",
        resolveAssetUrl,
      }),
    ],
    content: `<p><img src="asset://${ASSET_KEY}" alt="" /></p>`,
  });

  return editor;
}

/** Espera o `.then` da resolução do asset drenar a microtask queue. */
const drenar = () => new Promise((r) => setTimeout(r, 0));

describe("ImageUploadExtension — asset:// no editor", () => {
  it("nunca deixa `asset://` como src no DOM, nem antes de resolver", () => {
    // resolvedor que nunca assenta: prende o nodeView no estado intermediário
    montarEditor(() => new Promise<string | undefined>(() => {}));

    // Sem esperar nada: `asset://` não é protocolo de rede, e o `src` copiado
    // dos HTMLAttributes fazia o browser tentar carregar e falhar na hora.
    const img = document.querySelector("img");
    expect(img?.getAttribute("src") ?? "").not.toMatch(/^asset:\/\//);
  });

  it("troca o src pelo blob resolvido", async () => {
    const resolve = vi.fn().mockResolvedValue("blob:resolvido");
    montarEditor(resolve);
    await drenar();

    // a key chega íntegra, com a barra da pasta `assets/`
    expect(resolve).toHaveBeenCalledWith(ASSET_KEY);
    expect(document.querySelector("img")?.getAttribute("src")).toBe(
      "blob:resolvido"
    );
  });

  it("sinaliza visivelmente quando a resolução falha, em vez de falhar mudo", async () => {
    montarEditor(async () => undefined);
    await drenar();

    const img = document.querySelector("img");
    expect(img?.getAttribute("data-asset-error")).toBe("true");
    expect(img?.getAttribute("alt")).toContain("indisponível");
  });

  it("sinaliza também quando a promise rejeita (o `.catch` que faltava)", async () => {
    montarEditor(async () => {
      throw new Error("404");
    });
    await drenar();

    const img = document.querySelector("img");
    expect(img?.getAttribute("data-asset-error")).toBe("true");
  });

  it("sinaliza quando não há resolvedor configurado", async () => {
    montarEditor(undefined);
    await drenar();

    const img = document.querySelector("img");
    expect(img?.getAttribute("data-asset-error")).toBe("true");
  });
});

describe("ImageUploadExtension — largura padrão", () => {
  it("usa a constante compartilhada com o RichTextRenderer", () => {
    montarEditor(async () => "blob:x");

    // se este número divergir do teto da visualização, a imagem volta a mudar
    // de tamanho ao abrir o "Editar Conteúdo"
    expect(document.querySelector("img")?.style.width).toBe(
      `${RICH_TEXT_IMAGE_MAX_WIDTH}px`
    );
  });
});
