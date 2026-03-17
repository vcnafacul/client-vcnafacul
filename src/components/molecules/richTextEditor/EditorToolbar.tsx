import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Sigma,
  Strikethrough,
  Table,
} from "lucide-react";
import { useCallback, useRef } from "react";

interface EditorToolbarProps {
  editor: Editor;
  compact?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function EditorToolbar({
  editor,
  compact = false,
  onImageUpload,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;

      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url, 'data-asset-id': url } as any).run();
      } catch {
        console.error("Erro ao fazer upload da imagem");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor, onImageUpload]
  );

  const handleLatex = useCallback(() => {
    const formula = prompt("Digite a fórmula LaTeX:", "x^2 + y^2 = z^2");
    if (formula) {
      editor.commands.insertLatex(formula);
    }
  }, [editor]);

  const btnClass = (active: boolean) =>
    `p-1.5 rounded hover:bg-gray-200 transition-colors ${
      active ? "bg-gray-200 text-blue-600" : "text-gray-600"
    }`;

  const iconSize = compact ? 14 : 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
      {/* Text formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Negrito"
      >
        <Bold size={iconSize} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Itálico"
      >
        <Italic size={iconSize} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
        title="Tachado"
      >
        <Strikethrough size={iconSize} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive("code"))}
        title="Código"
      >
        <Code size={iconSize} />
      </button>

      {!compact && (
        <>
          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 1 }))}
            title="Título 1"
          >
            <Heading1 size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            title="Título 2"
          >
            <Heading2 size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            title="Título 3"
          >
            <Heading3 size={iconSize} />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive("bulletList"))}
            title="Lista"
          >
            <List size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive("orderedList"))}
            title="Lista numerada"
          >
            <ListOrdered size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btnClass(editor.isActive("blockquote"))}
            title="Citação"
          >
            <Quote size={iconSize} />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnClass(editor.isActive({ textAlign: "left" }))}
            title="Alinhar à esquerda"
          >
            <AlignLeft size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnClass(editor.isActive({ textAlign: "center" }))}
            title="Centralizar"
          >
            <AlignCenter size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnClass(editor.isActive({ textAlign: "right" }))}
            title="Alinhar à direita"
          >
            <AlignRight size={iconSize} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={btnClass(editor.isActive({ textAlign: "justify" }))}
            title="Justificar"
          >
            <AlignJustify size={iconSize} />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Table */}
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className={btnClass(false)}
            title="Inserir tabela"
          >
            <Table size={iconSize} />
          </button>
        </>
      )}

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* LaTeX */}
      <button
        type="button"
        onClick={handleLatex}
        className={btnClass(false)}
        title="Inserir fórmula LaTeX"
      >
        <Sigma size={iconSize} />
      </button>

      {/* Image */}
      {onImageUpload && (
        <>
          <button
            type="button"
            onClick={handleImageClick}
            className={btnClass(false)}
            title="Inserir imagem"
          >
            <ImagePlus size={iconSize} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
