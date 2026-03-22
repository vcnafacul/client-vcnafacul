import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface EssayEditorToolbarProps {
  editor: Editor;
}

export default function EssayEditorToolbar({ editor }: EssayEditorToolbarProps) {
  const btnClass = (active: boolean) =>
    `p-1.5 rounded hover:bg-gray-200 transition-colors ${
      active ? "bg-gray-200 text-blue-600" : "text-gray-600"
    }`;

  const iconSize = 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
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

      <div className="w-px h-5 bg-gray-300 mx-1" />

      {/* Lists & Blockquote */}
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
    </div>
  );
}
