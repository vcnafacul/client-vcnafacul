import { useState } from "react";
import { EssayTheme } from "@/dtos/essay";
import { RichTextEditor } from "@/components/molecules/richTextEditor/RichTextEditor";

interface ThemeFormProps {
  initial?: EssayTheme | null;
  onSave: (data: {
    title: string;
    motivationalText: string;
    instruction: string;
    weekStart: string;
    weekEnd: string;
  }) => void;
  onCancel: () => void;
}

export default function ThemeForm({ initial, onSave, onCancel }: ThemeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [motivationalText, setMotivationalText] = useState(
    initial?.motivationalText ?? "",
  );
  const [instruction, setInstruction] = useState(initial?.instruction ?? "");
  const [weekStart, setWeekStart] = useState(initial?.weekStart ?? "");
  const [weekEnd, setWeekEnd] = useState(initial?.weekEnd ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, motivationalText, instruction, weekStart, weekEnd });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
      >
        <h2 className="text-xl font-bold text-marine">
          {initial ? "Editar Tema" : "Novo Tema"}
        </h2>
        <div>
          <label className="block text-sm font-semibold mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Texto Motivador
          </label>
          <RichTextEditor
            content={motivationalText}
            onChange={setMotivationalText}
            placeholder="Digite os textos motivadores..."
            minHeight="200px"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
            Instrução (opcional)
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={3}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Início da Semana
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Fim da Semana
            </label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-grey text-grey rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-marine text-white rounded-lg hover:bg-marine/90"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
