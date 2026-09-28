import { ChevronLeft, ChevronRight } from "lucide-react";

/** Os botões "Anterior"/"Próxima" do modal da questão. */
export function NavegacaoDaLista({
  anterior,
  proxima,
  posicao,
  total,
}: {
  anterior?: () => void;
  proxima?: () => void;
  posicao?: number | null;
  total?: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm" data-navegacao-da-lista>
      <button
        type="button"
        aria-label="Questão anterior"
        onClick={anterior}
        disabled={!anterior}
        className="flex items-center rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>
      {posicao != null && total != null && (
        <span className="text-gray-500 tabular-nums">
          {posicao} de {total}
        </span>
      )}
      <button
        type="button"
        aria-label="Próxima questão"
        onClick={proxima}
        disabled={!proxima}
        className="flex items-center rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
