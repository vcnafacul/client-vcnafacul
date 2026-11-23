import { useState, useMemo, useEffect } from 'react';
import { getMaterias } from '@/services/content/getMaterias';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFrentesSelection } from '../hooks/useFrentesSelection';
import { X } from 'lucide-react';

interface CollaboratorFrentesProps {
  token: string;
  initialSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function CollaboratorFrentes({
  token,
  initialSelectedIds = [],
  onSelectionChange,
}: CollaboratorFrentesProps) {
  const {
    availableFrentes,
    selectedFrentes,
    isLoading,
    selectFrente,
    removeFrente,
  } = useFrentesSelection({
    token,
    initialSelectedIds,
    onSelectionChange,
  });

  const [materiaNomeMap, setMateriaNomeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    getMaterias(token)
      .then((materias) => {
        const map: Record<string, string> = {};
        materias.forEach((m) => { map[m._id] = m.nome; });
        setMateriaNomeMap(map);
      })
      .catch((err) => console.error("Erro ao carregar matérias:", err));
  }, [token]);

  // A busca do Combobox cobre o nome da frente e o da matéria: os dois vão no rótulo.
  const opcoes = useMemo(
    () =>
      availableFrentes.map((frente) => ({
        value: frente.id,
        label: `${frente.nome ?? "—"} · ${materiaNomeMap[frente.materia] ?? frente.materia}`,
      })),
    [availableFrentes, materiaNomeMap],
  );

  const handleSelect = (frenteId: string) => selectFrente(frenteId);

  const handleRemove = (frenteId: string) => {
    removeFrente(frenteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded-sm animate-pulse"></div>
        <div className="h-20 bg-muted rounded-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label
          id="frentes-de-afinidade-rotulo"
          htmlFor="frentes-de-afinidade"
          className="block text-body font-medium text-foreground mb-2"
        >
          Frentes de Afinidade
        </Label>
        <p className="text-caption text-muted-foreground mb-4">
          Selecione as frentes com as quais você tem mais afinidade. Digite o nome da frente ou da matéria para filtrar; a lista completa pode ser rolada.
        </p>

        {/* Busca e seleção: Combobox do ui (popover com busca por frente ou matéria) */}
        <Combobox
          id="frentes-de-afinidade"
          aria-labelledby="frentes-de-afinidade-rotulo"
          options={opcoes}
          value=""
          onValueChange={handleSelect}
          placeholder="Buscar por nome da frente ou da matéria..."
          searchPlaceholder="Buscar por nome da frente ou da matéria..."
          emptyText="Nenhuma frente encontrada"
        />
      </div>

      {/* Frentes selecionadas */}
      {selectedFrentes.length > 0 && (
        <div>
          <p className="block text-body font-medium text-foreground mb-2">
            Frentes Selecionadas ({selectedFrentes.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFrentes.map((frente) => (
              <Badge
                key={frente.id}
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-foreground hover:bg-accent transition-colors"
              >
                <span className="text-body">{frente.nome ?? "—"}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(frente.id)}
                  className="ml-1 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  aria-label={`Remover ${frente.nome}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedFrentes.length === 0 && (
        <div className="text-body text-muted-foreground italic">
          Nenhuma frente selecionada ainda. Use o campo acima para buscar e selecionar.
        </div>
      )}
    </div>
  );
}


