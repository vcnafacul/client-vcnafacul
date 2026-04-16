import { EditorContent } from "@tiptap/react";
import { useEssayEditor } from "./useEssayEditor";
import EssayEditorToolbar from "./EssayEditorToolbar";

interface EssayEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
}

export default function EssayEditor({
  content,
  onChange,
  onWordCountChange,
  placeholder = "Comece sua redacao aqui...",
}: EssayEditorProps) {
  const { editor, getWordCount } = useEssayEditor({
    content,
    onChange: (md) => {
      onChange(md);
      if (onWordCountChange) {
        onWordCountChange(getWordCount());
      }
    },
    placeholder,
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white">
      <EssayEditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[400px] p-4 prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-marine rounded-b-lg"
      />
    </div>
  );
}
