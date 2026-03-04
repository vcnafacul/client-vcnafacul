import { Badge } from "@/components/ui/badge";
import { Afinidade } from "@/types/partnerPrepCourse/afinidades";
import { getColorFromName, getTextColorFromName } from "@/utils/getColorFromName";
import { useMemo } from "react";

interface CollaboratorFrentesDisplayProps {
  afinidades: Afinidade[];
  token?: string; // Mantido para compatibilidade, mas não é mais necessário
}

export function CollaboratorFrentesDisplay({
  afinidades,
}: CollaboratorFrentesDisplayProps) {
  // Extrair todas as frentes como array de strings (sem repetição)
  const allFrentes: string[] = useMemo(() => {
    const frentesSet = new Set(
      afinidades.map((afinidade) => afinidade.frenteNome)
    );
    return Array.from(frentesSet);
  }, [afinidades]);

  // Extrair matérias únicas como array de strings (sem repetição)
  const allMaterias: string[] = useMemo(() => {
    const materiasSet = new Set(
      afinidades.map((afinidade) => afinidade.materiaNome)
    );
    return Array.from(materiasSet);
  }, [afinidades]);

  if (afinidades.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Nenhuma frente selecionada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Grupo de Frentes */}
      {allFrentes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">
            Frentes ({allFrentes.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {allFrentes.map((frenteNome) => {
              const frenteColor = getColorFromName(frenteNome);
              const frenteText = getTextColorFromName(frenteNome);
              return (
                <Badge
                  key={frenteNome}
                  variant="secondary"
                  className={`inline-flex items-center px-3 py-1 text-xs ${frenteColor} ${frenteText}`}
                >
                  {frenteNome}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Grupo de Matérias */}
      {allMaterias.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">
            Matérias ({allMaterias.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {allMaterias.map((materiaNome) => {
              const materiaColor = getColorFromName(materiaNome);
              const materiaText = getTextColorFromName(materiaNome);
              return (
                <Badge
                  key={materiaNome}
                  variant="secondary"
                  className={`inline-flex items-center px-3 py-1 text-xs ${materiaColor} ${materiaText}`}
                >
                  {materiaNome}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
