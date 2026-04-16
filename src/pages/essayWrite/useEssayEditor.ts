import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import { useCallback, useEffect, useRef } from "react";

interface UseEssayEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEditorMarkdown(ed: any): string {
  return ed.storage.markdown?.getMarkdown?.() ?? ed.getText();
}

export function useEssayEditor({
  content,
  onChange,
  placeholder = "Comece sua redacao aqui...",
}: UseEssayEditorProps) {
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 5000 }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingRef.current) return;
      onChange(getEditorMarkdown(ed));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentMd = getEditorMarkdown(editor);
    if (content !== currentMd) {
      isUpdatingRef.current = true;
      editor.commands.setContent(content || "");
      isUpdatingRef.current = false;
    }
  }, [content, editor]);

  const getMarkdown = useCallback(() => {
    if (!editor) return "";
    return getEditorMarkdown(editor);
  }, [editor]);

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (editor.storage as any).characterCount?.words?.() ?? 0;
  }, [editor]);

  return { editor, getMarkdown, getWordCount };
}
