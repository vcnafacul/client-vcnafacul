import { useState } from "react";
import { EssayTheme } from "@/dtos/essay";
import RichTextRenderer from "@/components/atoms/richTextRenderer/RichTextRenderer";

interface ThemeDisplayProps {
  theme: EssayTheme;
}

export default function ThemeDisplay({ theme }: ThemeDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-lg font-bold text-marine">{theme.title}</h2>
        <span className="text-sm text-grey">
          {expanded ? "Recolher" : "Expandir"}
        </span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-grey mb-2">
              Textos motivadores
            </h3>
            <div className="prose prose-sm max-w-none">
              <RichTextRenderer
                content={theme.motivationalText}
                contentFormat="markdown"
              />
            </div>
          </div>
          {theme.instruction && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Instrucao:</strong> {theme.instruction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
