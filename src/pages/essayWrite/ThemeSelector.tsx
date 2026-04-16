import { Link } from "react-router-dom";
import { EssayTheme } from "@/dtos/essay";
import { ESSAY_HISTORY } from "@/routes/path";

interface ThemeSelectorProps {
  themes: EssayTheme[];
  onSelect: (theme: EssayTheme) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ThemeSelector({ themes, onSelect }: ThemeSelectorProps) {
  if (themes.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center space-y-3">
        <p className="text-marine font-semibold">
          Você já escreveu sobre todos os temas disponíveis!
        </p>
        <p className="text-sm text-gray-600">
          Aguarde novos temas ou confira suas redações anteriores.
        </p>
        <Link
          to={`/dashboard/${ESSAY_HISTORY}`}
          className="inline-block mt-2 px-6 py-2 border border-marine text-marine rounded-lg hover:bg-gray-50"
        >
          Ver histórico
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Escolha um dos temas disponíveis para escrever sua redação:
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="border rounded-lg p-5 bg-white hover:shadow-md transition-shadow space-y-3"
          >
            <h3 className="font-semibold text-marine text-lg">{theme.title}</h3>
            <p className="text-xs text-gray-500">
              {formatDate(theme.weekStart)} — {formatDate(theme.weekEnd)}
            </p>
            {theme.instruction && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {theme.instruction}
              </p>
            )}
            <button
              onClick={() => onSelect(theme)}
              className="w-full mt-2 px-4 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 text-sm font-medium"
            >
              Escrever
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
