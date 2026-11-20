import { Link } from "react-router-dom";
import { EssayTheme } from "@/dtos/essay";
import { ESSAY_HISTORY } from "@/routes/path";
import { dataLocal } from "@/utils/date";

interface ThemeSelectorProps {
  themes: EssayTheme[];
  onSelect: (theme: EssayTheme) => void;
}

// `weekStart`/`weekEnd` chegam como "YYYY-MM-DD" (coluna `date`): com
// `new Date` seriam lidos em UTC e mostrariam o dia anterior no Brasil.
function formatDate(dateStr: string): string {
  return dataLocal(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ThemeSelector({ themes, onSelect }: ThemeSelectorProps) {
  if (themes.length === 0) {
    return (
      <div className="bg-info-muted border border-border rounded-lg p-6 text-center space-y-3">
        <p className="text-foreground font-semibold">
          Você já escreveu sobre todos os temas disponíveis!
        </p>
        <p className="text-body text-muted-foreground">
          Aguarde novos temas ou confira suas redações anteriores.
        </p>
        <Link
          to={`/dashboard/${ESSAY_HISTORY}`}
          className="inline-block mt-2 px-6 py-2 border border-primary text-foreground rounded-lg hover:bg-page"
        >
          Ver histórico
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-body text-muted-foreground">
        Escolha um dos temas disponíveis para escrever sua redação:
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="border rounded-lg p-5 bg-white hover:shadow-md transition-shadow space-y-3"
          >
            <h3 className="font-semibold text-foreground text-h3">{theme.title}</h3>
            <p className="text-caption text-muted-foreground">
              {formatDate(theme.weekStart)} — {formatDate(theme.weekEnd)}
            </p>
            {theme.instruction && (
              <p className="text-body text-muted-foreground line-clamp-3">
                {theme.instruction}
              </p>
            )}
            <button
              onClick={() => onSelect(theme)}
              className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-body font-medium"
            >
              Escrever
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
