import { AlertTriangle, Info } from "lucide-react";
import { avisoDoResultado } from "./textos";

/**
 * O aviso de anulação no resultado do aluno (tickets/042, card 16) — é a tela
 * para onde o push "nota atualizada" leva.
 */
export function AvisoDoResultado(props: Parameters<typeof avisoDoResultado>[0]) {
  const aviso = avisoDoResultado(props);
  if (!aviso) return null;
  const pendente = aviso.tipo === "divergente";
  return (
    <p
      role="note"
      data-testid="aviso-do-resultado"
      data-tipo={aviso.tipo}
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
        pendente
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-sky-200 bg-sky-50 text-sky-900"
      }`}
    >
      {pendente ? (
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      ) : (
        <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      )}
      <span>{aviso.texto}</span>
    </p>
  );
}
