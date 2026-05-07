import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import { useCallback, useEffect, useRef } from "react";
import { LatexExtension } from "./extensions/LatexExtension";
import { ImageUploadExtension } from "./extensions/ImageUploadExtension";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { getQuestionImage } from "@/services/question/getQuestionImage";

type FetchAsset = (key: string, token: string) => Promise<Blob>;

interface UseRichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  pendingStore?: PendingImageStore;
  token?: string;
  fetchAsset?: FetchAsset;
}

/**
 * Get markdown from editor, then post-process to restore LaTeX delimiters.
 * tiptap-markdown doesn't know about our custom `latex` node, so it renders
 * them as empty or as HTML. We walk the JSON doc and splice the formulas back.
 */
function getMarkdownFromEditor(editor: any): string {
  const raw: string =
    editor.storage.markdown?.getMarkdown?.() ?? editor.getHTML();

  // Walk the ProseMirror doc and collect latex nodes with positions
  const doc = editor.state.doc;
  const latexNodes: { formula: string; displayMode: boolean }[] = [];

  doc.descendants((node: any) => {
    if (node.type.name === "latex") {
      latexNodes.push({
        formula: node.attrs.formula,
        displayMode: node.attrs.displayMode,
      });
    }
  });

  if (latexNodes.length === 0) return raw;

  // The tiptap-markdown serializer will output empty string or inline code
  // for unknown nodes. We replace those placeholders sequentially.
  let result = raw;
  for (const { formula, displayMode } of latexNodes) {
    const delimited = displayMode ? `$$${formula}$$` : `$${formula}$`;
    result = result.replace(/(?:``|$)/, (match) => {
      if (match === "``") return delimited;
      return match;
    });
  }

  // Fallback: if the above replacement didn't work (no `` placeholders),
  // do a simpler approach — re-serialize from scratch
  if (latexNodes.length > 0 && !result.includes("$")) {
    return serializeDocToMarkdown(doc);
  }

  return result;
}

/**
 * Manual serialization that properly handles latex nodes and text-align.
 */
function serializeDocToMarkdown(doc: any): string {
  const parts: string[] = [];

  doc.content.forEach((block: any) => {
    const align = block.attrs?.textAlign;
    const wrapAlign = (text: string) => {
      if (align && align !== "left") {
        return `<div style="text-align: ${align}">\n\n${text}\n\n</div>`;
      }
      return text;
    };

    if (block.type.name === "paragraph") {
      parts.push(wrapAlign(serializeInlineContent(block)));
    } else if (block.type.name === "heading") {
      const prefix = "#".repeat(block.attrs.level);
      parts.push(wrapAlign(`${prefix} ${serializeInlineContent(block)}`));
    } else if (block.type.name === "bulletList") {
      const items: string[] = [];
      block.content.forEach((li: any) => {
        li.content.forEach((p: any) => {
          items.push(`- ${serializeInlineContent(p)}`);
        });
      });
      parts.push(items.join("\n"));
    } else if (block.type.name === "orderedList") {
      const items: string[] = [];
      let i = 1;
      block.content.forEach((li: any) => {
        li.content.forEach((p: any) => {
          items.push(`${i}. ${serializeInlineContent(p)}`);
          i++;
        });
      });
      parts.push(items.join("\n"));
    } else if (block.type.name === "blockquote") {
      block.content.forEach((p: any) => {
        parts.push(`> ${serializeInlineContent(p)}`);
      });
    } else if (block.type.name === "codeBlock") {
      parts.push(`\`\`\`\n${block.textContent}\n\`\`\``);
    } else {
      parts.push(block.textContent || "");
    }
  });

  return parts.join("\n\n");
}

function serializeInlineContent(node: any): string {
  if (!node.content) return "";
  const parts: string[] = [];

  node.content.forEach((child: any) => {
    if (child.type.name === "text") {
      let text = child.text || "";
      const marks = child.marks || [];
      for (const mark of marks) {
        if (mark.type.name === "bold") text = `**${text}**`;
        else if (mark.type.name === "italic") text = `*${text}*`;
        else if (mark.type.name === "strike") text = `~~${text}~~`;
        else if (mark.type.name === "code") text = `\`${text}\``;
      }
      parts.push(text);
    } else if (child.type.name === "latex") {
      const formula = child.attrs.formula;
      const displayMode = child.attrs.displayMode;
      parts.push(displayMode ? `$$${formula}$$` : `$${formula}$`);
    } else if (child.type.name === "image") {
      const alt = child.attrs.alt || "";
      const src = child.attrs["data-asset-id"] || child.attrs.src || "";
      const width = child.attrs.width;
      const height = child.attrs.height;
      const align = child.attrs.textAlign;
      const hasSize = width && height;
      const hasAlign = align && align !== "left";

      if (hasSize || hasAlign) {
        const sizeAttrs = hasSize
          ? ` width="${Math.round(width)}" height="${Math.round(height)}"`
          : "";
        const imgTag = `<img src="${src}" alt="${alt}"${sizeAttrs} />`;
        if (hasAlign) {
          parts.push(
            `<div style="text-align: ${align}">${imgTag}</div>`
          );
        } else {
          parts.push(imgTag);
        }
      } else {
        parts.push(`![${alt}](${src})`);
      }
    } else if (child.type.name === "hardBreak") {
      parts.push("\n");
    }
  });

  return parts.join("");
}

/**
 * Pre-process markdown content to convert LaTeX delimiters into
 * HTML spans that the LatexExtension's parseHTML can pick up.
 */
function preprocessLatex(markdown: string): string {
  if (!markdown) return markdown;

  // Replace $$...$$  (display math) — must come first
  let result = markdown.replace(
    /\$\$([^$]+?)\$\$/g,
    (_match, formula) =>
      `<span data-latex="${escapeHtml(formula)}" data-display="true"></span>`
  );

  // Replace $...$  (inline math) — avoid matching $$
  result = result.replace(
    /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (_match, formula) =>
      `<span data-latex="${escapeHtml(formula)}" data-display="false"></span>`
  );

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function useRichTextEditor({
  content,
  onChange,
  placeholder,
  onImageUpload,
  pendingStore,
  token,
  fetchAsset = getQuestionImage,
}: UseRichTextEditorProps) {
  const isUpdatingRef = useRef(false);
  const assetBlobCacheRef = useRef(new Map<string, string>());

  const resolvePendingUrl = useCallback(
    (tempId: string) => pendingStore?.getBlobUrl(tempId),
    [pendingStore]
  );

  const resolveAssetUrl = useCallback(
    async (assetId: string) => {
      const cache = assetBlobCacheRef.current;
      if (cache.has(assetId)) return cache.get(assetId);
      if (!token) return undefined;
      try {
        const blob = await fetchAsset(assetId, token);
        const blobUrl = URL.createObjectURL(blob);
        cache.set(assetId, blobUrl);
        return blobUrl;
      } catch {
        return undefined;
      }
    },
    [token, fetchAsset]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder: placeholder || "Digite aqui...",
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      LatexExtension,
      ImageUploadExtension.configure({
        onUpload: onImageUpload || (async () => ""),
        resolvePendingUrl,
        resolveAssetUrl,
      }),
    ],
    content: preprocessLatex(content),
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingRef.current) return;
      const markdown = getMarkdownFromEditor(ed);
      onChange(markdown);
    },
  });

  // Sync external content changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const currentMarkdown = getMarkdownFromEditor(editor);
    if (content !== currentMarkdown) {
      isUpdatingRef.current = true;
      editor.commands.setContent(preprocessLatex(content || ""));
      isUpdatingRef.current = false;
    }
  }, [content, editor]);

  const getMarkdown = useCallback(() => {
    if (!editor) return "";
    return getMarkdownFromEditor(editor);
  }, [editor]);

  return { editor, getMarkdown };
}
