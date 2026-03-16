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
}

const ASSET_PROTOCOL = "asset://";

const components: Components = {
  img: ({ src, alt, ...props }) => {
    if (src?.startsWith(ASSET_PROTOCOL)) {
      const assetId = src.slice(ASSET_PROTOCOL.length);
      return (
        <AssetImage
          assetId={assetId}
          alt={alt || ""}
          className="max-w-full rounded"
        />
      );
    }
    return <img src={src} alt={alt} className="max-w-full rounded" {...props} />;
  },
};

export function RichTextRenderer({
  content,
  contentFormat = "plain",
  className = "",
}: RichTextRendererProps) {
  if (!content) {
    return <span className="text-gray-400">Sem texto</span>;
  }

  if (contentFormat === "plain") {
    return (
      <p className={`whitespace-pre-wrap ${className}`}>{content}</p>
    );
  }

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
