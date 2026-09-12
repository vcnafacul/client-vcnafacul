import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichTextRenderer } from "./RichTextRenderer";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "fake-token" } }),
}));

const ASSET_KEY = "assets/990cdfb0-06c6-48a6-ae84-451fde0184a3.png";

/** `![](asset://…)` — forma emitida pelo editor quando a imagem não tem width/height. */
const MD_ASSET = `Enunciado da questão.\n\n![](asset://${ASSET_KEY})`;

/**
 * `<img src="asset://…" width=… />` — forma emitida por
 * `useRichTextEditor.serializeInlineContent` quando a imagem foi redimensionada
 * ou alinhada. Markdown não expressa width/height, então o serializador cai em
 * HTML cru, que chega aqui via `rehypeRaw`.
 */
const HTML_ASSET = `Enunciado da questão.\n\n<img src="asset://${ASSET_KEY}" alt="" width="300" height="200" />`;

function renderAsset(content: string, fetchAsset = okFetch()) {
  return render(
    <RichTextRenderer
      content={content}
      contentFormat="markdown"
      fetchAsset={fetchAsset}
    />
  );
}

function okFetch() {
  return vi.fn().mockResolvedValue(new Blob(["x"], { type: "image/png" }));
}

/**
 * O editor emite `![](…)` com alt vazio, e `<img alt="">` tem role
 * `presentation`, não `img` — por isso a busca é pelo elemento, não pelo role.
 */
async function findImgSrc(): Promise<string> {
  return await waitFor(() => {
    const img = document.querySelector("img");
    const src = img?.getAttribute("src");
    if (!src) throw new Error("nenhum <img> com src ainda");
    return src;
  });
}

beforeEach(() => {
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:fake-url"),
    revokeObjectURL: vi.fn(),
  });
});

describe("RichTextRenderer — asset:// (defeito 2)", () => {
  it("resolve `![](asset://…)` pelo AssetImage em vez de descartar a URL", async () => {
    const fetchAsset = okFetch();
    renderAsset(MD_ASSET, fetchAsset);

    // a chave chega íntegra, com a barra da pasta `assets/`
    expect(fetchAsset).toHaveBeenCalledWith(ASSET_KEY, "fake-token");
    expect(await findImgSrc()).toBe("blob:fake-url");
  });

  it("resolve `<img src=\"asset://…\">` cru (imagem redimensionada) pelo AssetImage", async () => {
    const fetchAsset = okFetch();
    renderAsset(HTML_ASSET, fetchAsset);

    expect(fetchAsset).toHaveBeenCalledWith(ASSET_KEY, "fake-token");
    expect(await findImgSrc()).toBe("blob:fake-url");
  });

  it("repassa width/height do html cru para a imagem resolvida", async () => {
    renderAsset(HTML_ASSET);
    await findImgSrc();

    const img = document.querySelector("img");
    expect(img?.style.width).toBe("300px");
    expect(img?.style.height).toBe("200px");
  });

  it("mostra `[Imagem indisponível]` quando o asset não resolve, em vez de sumir", async () => {
    const fetchAsset = vi.fn().mockRejectedValue(new Error("404"));
    renderAsset(MD_ASSET, fetchAsset);

    expect(await screen.findByText("[Imagem indisponível]")).toBeVisible();
  });

  it("nunca deixa um `<img src=\"\">` invisível no lugar do asset", async () => {
    renderAsset(MD_ASSET);
    await findImgSrc();
    expect(document.querySelectorAll('img[src=""]')).toHaveLength(0);
  });

  it("não vaza a prop `node` do react-markdown como atributo do DOM", async () => {
    renderAsset(MD_ASSET);
    await findImgSrc();
    expect(document.querySelector("img[node]")).toBeNull();
  });
});

describe("RichTextRenderer — imagem externa", () => {
  it("renderiza imagem https normalmente", () => {
    render(
      <RichTextRenderer
        content="![gráfico](https://enem.dev/grafico.png)"
        contentFormat="markdown"
      />
    );

    const img = screen.getByRole("img", { name: "gráfico" });
    expect(img).toHaveAttribute("src", "https://enem.dev/grafico.png");
  });
});

/**
 * O `urlTransform` do react-markdown é a única proteção contra protocolos
 * perigosos em conteúdo escrito por usuário. Preservar `asset://` não pode
 * custar essa proteção — daí estes testes serem explícitos.
 */
describe("RichTextRenderer — protocolos perigosos continuam bloqueados", () => {
  const perigosos: [string, string][] = [
    ["javascript: em markdown", "![x](javascript:alert(1))"],
    ["data:text/html em markdown", "![x](data:text/html,<script>alert(1)</script>)"],
    ["vbscript: em markdown", "![x](vbscript:msgbox(1))"],
    ["javascript: em html cru", '<img src="javascript:alert(1)" alt="x" />'],
    [
      "data:text/html em html cru",
      '<img src="data:text/html,<script>alert(1)</script>" alt="x" />',
    ],
  ];

  it.each(perigosos)("bloqueia %s", (_label, content) => {
    render(<RichTextRenderer content={content} contentFormat="markdown" />);

    for (const img of Array.from(document.querySelectorAll("img"))) {
      const src = img.getAttribute("src") ?? "";
      expect(src).not.toMatch(/^\s*(javascript|data|vbscript|file):/i);
    }
  });

  it("não trata `asset://` perigoso como asset quando o protocolo é outro", () => {
    render(
      <RichTextRenderer
        content="![x](javascript:alert('asset://a'))"
        contentFormat="markdown"
      />
    );

    const img = document.querySelector("img");
    expect(img?.getAttribute("src") ?? "").not.toMatch(/^javascript:/i);
  });
});

describe("RichTextRenderer — contentFormat plain", () => {
  it("mostra o markdown literal, sem sumir com a linha", () => {
    render(
      <RichTextRenderer
        content={`Enunciado.\n\n![](asset://${ASSET_KEY})`}
        contentFormat="plain"
      />
    );

    expect(screen.getByText(/!\[\]\(asset:\/\//)).toBeVisible();
  });
});

/**
 * O editor limita a imagem a `RICH_TEXT_IMAGE_MAX_WIDTH` quando a questão não
 * tem width/height salvos, e respeita as dimensões quando tem. A visualização
 * não limitava nada — daí a mesma imagem mudar de tamanho ao abrir a edição.
 * `maxImageWidth` reproduz a regra do editor, e só onde é pedida.
 */
describe("RichTextRenderer — maxImageWidth (paridade com o editor)", () => {
  it("limita a imagem sem dimensões salvas, como o editor faz", async () => {
    render(
      <RichTextRenderer
        content={`![](asset://${ASSET_KEY})`}
        contentFormat="markdown"
        fetchAsset={okFetch()}
        maxImageWidth={300}
      />
    );
    await findImgSrc();

    // min() para não estourar container mais estreito que o teto
    expect(document.querySelector("img")?.style.maxWidth).toBe(
      "min(100%, 300px)"
    );
  });

  it("limita também imagem externa", () => {
    render(
      <RichTextRenderer
        content="![g](https://enem.dev/g.png)"
        contentFormat="markdown"
        maxImageWidth={300}
      />
    );

    expect(document.querySelector("img")?.style.maxWidth).toBe(
      "min(100%, 300px)"
    );
  });

  it("não limita quando a questão tem dimensões salvas — o editor também não", async () => {
    render(
      <RichTextRenderer
        content={`<img src="asset://${ASSET_KEY}" alt="" width="500" height="400" />`}
        contentFormat="markdown"
        fetchAsset={okFetch()}
        maxImageWidth={300}
      />
    );
    await findImgSrc();

    const img = document.querySelector("img");
    expect(img?.style.width).toBe("500px");
    expect(img?.style.height).toBe("400px");
    // um 500px salvo continua 500px nos dois lados; capar aqui criaria
    // uma divergência nova em vez de fechar a existente
    expect(img?.style.maxWidth).toBe("100%");
  });

  it("sem a prop, não limita nada — a prova do aluno fica intocada", async () => {
    render(
      <RichTextRenderer
        content={`![](asset://${ASSET_KEY})`}
        contentFormat="markdown"
        fetchAsset={okFetch()}
      />
    );
    await findImgSrc();

    expect(document.querySelector("img")?.style.maxWidth).toBe("");
  });
});
