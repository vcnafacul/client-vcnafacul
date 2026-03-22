import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";

interface EssayEditorProps {
  content: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function EssayEditor({
  content,
  onChange,
  placeholder = "Comece sua redacao aqui...",
}: EssayEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        heading: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 5000 }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
  });

  useEffect(() => {
    if (editor && content === "" && editor.getText() !== "") {
      editor.commands.clearContent();
    }
  }, [content, editor]);

  return (
    <div className="border rounded-lg bg-white">
      <EditorContent
        editor={editor}
        className="min-h-[400px] p-4 prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-marine rounded-lg"
      />
    </div>
  );
}
