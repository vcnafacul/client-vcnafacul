import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import { AssetImage } from "./AssetImage";
import type { Components } from "react-markdown";

interface RichTextRendererProps {
  content: string;
  contentFormat?: "plain" | "markdown";
  className?: string;
  fetchAsset?: (key: string, token: string) => Promise<Blob>;
  /**
   * Teto de largura, em px, para imagem **sem** width/height salvos — a mesma
   * regra que o `ImageUploadExtension` aplica no editor, para a imagem não
   * mudar de tamanho ao alternar entre visualizar e editar.
   *
   * Opcional de propósito: só o modal do banco de questões passa. Ligar por
   * padrão encolheria imagem na prova do aluno, que usa este mesmo componente.
   */
  maxImageWidth?: number;
}

const ASSET_PROTOCOL = "asset://";

/**
 * A partir da v9 o react-markdown descarta URLs de protocolo desconhecido — só
 * passam `http`, `https`, `mailto`, `tel` e caminhos relativos. `asset://` não
 * está na lista, então o `src` chegava vazio ao componente `img` abaixo: o
 * `AssetImage` nunca era montado e sobrava um `<img src="">`, que não ocupa
 * espaço e não dá erro. Era isso que fazia a linha da imagem sumir.
 *
 * Preservamos `asset://` — que é inerte, nunca vira navegação, só é fatiado
 * para virar key no S3 — e delegamos todo o resto ao `defaultUrlTransform`.
 * Trocar isto por `(url) => url` desligaria a proteção inteira e reabriria
 * `javascript:` e `data:` em conteúdo escrito por usuário.
 */
function assetAwareUrlTransform(url: string): string {
  return url.startsWith(ASSET_PROTOCOL) ? url : defaultUrlTransform(url);
}

export function RichTextRenderer({
  content,
  contentFormat = "plain",
  className = "",
  fetchAsset,
  maxImageWidth,
}: RichTextRendererProps) {
  if (!content) {
    return <span className="text-gray-400">Sem texto</span>;
  }

  if (contentFormat === "plain") {
    return (
      <p className={`whitespace-pre-wrap ${className}`}>{content}</p>
    );
  }

  const components: Components = {
    // Sem rest-spread de propósito: o react-markdown injeta a prop `node` do
    // mdast (que virava um atributo `node="[object Object]"` inválido no DOM) e
    // o `rehypeRaw` repassa qualquer atributo do `<img>` cru escrito no
    // enunciado. Listamos explicitamente o que atravessa.
    img: ({ src, alt, title, width, height }) => {
      const w = width ? Number(width) : undefined;
      const h = height ? Number(height) : undefined;

      // Espelha o `if (!savedWidth && !savedHeight)` do ImageUploadExtension:
      // dimensão salva manda nos dois lados, e o teto só vale na ausência dela.
      // Capar uma imagem salva em 500px criaria uma divergência nova — o editor
      // continuaria mostrando 500px.
      const sizeStyle: React.CSSProperties | undefined =
        w && h
          ? { width: `${w}px`, height: `${h}px`, maxWidth: "100%" }
          : maxImageWidth
            ? { maxWidth: `min(100%, ${maxImageWidth}px)` }
            : undefined;

      if (src?.startsWith(ASSET_PROTOCOL)) {
        const assetId = src.slice(ASSET_PROTOCOL.length);
        return (
          <AssetImage
            assetId={assetId}
            alt={alt || ""}
            className="max-w-full rounded"
            style={sizeStyle}
            fetchAsset={fetchAsset}
          />
        );
      }
      return (
        <img
          src={src}
          alt={alt}
          title={title}
          className="max-w-full rounded"
          style={sizeStyle}
        />
      );
    },
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        urlTransform={assetAwareUrlTransform}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default RichTextRenderer;
