import ReactMarkdown from "react-markdown";
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
}

const ASSET_PROTOCOL = "asset://";

export function RichTextRenderer({
  content,
  contentFormat = "plain",
  className = "",
  fetchAsset,
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
    img: ({ src, alt, width, height, ...props }) => {
      const w = width ? Number(width) : undefined;
      const h = height ? Number(height) : undefined;
      const sizeStyle: React.CSSProperties | undefined =
        w && h
          ? { width: `${w}px`, height: `${h}px`, maxWidth: "100%" }
          : undefined;

      if (src?.startsWith(ASSET_PROTOCOL)) {
        const assetId = src.slice(ASSET_PROTOCOL.length);
        return (
          <AssetImage
            assetId={assetId}
            alt={alt || ""}
            className="max-w-full rounded"
            width={w}
            height={h}
            fetchAsset={fetchAsset}
          />
        );
      }
      return (
        <img
          src={src}
          alt={alt}
          className="max-w-full rounded"
          style={sizeStyle}
          {...props}
        />
      );
    },
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default RichTextRenderer;
