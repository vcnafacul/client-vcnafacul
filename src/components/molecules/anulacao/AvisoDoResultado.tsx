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
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-body ${
        pendente
          ? "border-warning bg-warning-muted text-foreground"
          : "border-info bg-info-muted text-foreground"
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
