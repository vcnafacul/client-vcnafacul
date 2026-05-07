import { EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import { useRichTextEditor } from "./useRichTextEditor";
import { Code, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import "katex/dist/katex.min.css";
import "./richTextEditor.css";
import { PendingImageStore } from "@/utils/pendingImageStore";

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  compact?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
  minHeight?: string;
  error?: boolean;
  pendingStore?: PendingImageStore;
  token?: string;
  fetchAsset?: (key: string, token: string) => Promise<Blob>;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  compact = false,
  onImageUpload,
  className = "",
  minHeight,
  error = false,
  pendingStore,
  token,
  fetchAsset,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "markdown">("visual");
  const [rawMarkdown, setRawMarkdown] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { editor, getMarkdown } = useRichTextEditor({
    content,
    onChange,
    placeholder,
    onImageUpload,
    pendingStore,
    token,
    fetchAsset,
  });

  // Sync rawMarkdown when content changes externally
  useEffect(() => {
    if (mode === "markdown") {
      setRawMarkdown(content);
    }
  }, [content, mode]);

  const switchToMarkdown = useCallback(() => {
    if (editor) {
      const md = getMarkdown();
      setRawMarkdown(md);
    }
    setMode("markdown");
  }, [editor, getMarkdown]);

  const switchToVisual = useCallback(() => {
    // Push raw markdown into the editor
    onChange(rawMarkdown);
    setMode("visual");
  }, [rawMarkdown, onChange]);

  const handleRawChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setRawMarkdown(val);
      onChange(val);
    },
    [onChange]
  );

  if (!editor) return null;

  const defaultMinHeight = compact ? "60px" : "120px";
  const resolvedMinHeight = minHeight || defaultMinHeight;

  return (
    <div
      className={`border rounded-md overflow-hidden ${
        error ? "border-red-500" : "border-gray-300"
      } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${className}`}
    >
      {/* Mode toggle + toolbar */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        {mode === "visual" && (
          <div className="flex-1">
            <EditorToolbar
              editor={editor}
              compact={compact}
              onImageUpload={onImageUpload}
            />
          </div>
        )}
        {mode === "markdown" && (
          <div className="flex-1 px-2 py-1.5">
            <span className="text-xs font-medium text-gray-500">
              Modo Markdown
            </span>
          </div>
        )}
        <div className="flex items-center gap-0.5 px-2 border-l border-gray-200">
          <button
            type="button"
            onClick={mode === "visual" ? switchToMarkdown : switchToVisual}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600`}
            title={
              mode === "visual"
                ? "Editar Markdown"
                : "Voltar ao modo visual"
            }
          >
            {mode === "visual" ? (
              <Code size={compact ? 14 : 16} />
            ) : (
              <Eye size={compact ? 14 : 16} />
            )}
          </button>
        </div>
      </div>

      {/* Editor area */}
      {mode === "visual" ? (
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-3 py-2"
          style={{ minHeight: resolvedMinHeight }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={rawMarkdown}
          onChange={handleRawChange}
          placeholder={placeholder || "Digite markdown aqui..."}
          className="w-full px-3 py-2 font-mono text-sm resize-y outline-none bg-white"
          style={{ minHeight: resolvedMinHeight }}
        />
      )}
    </div>
  );
}

export default RichTextEditor;
