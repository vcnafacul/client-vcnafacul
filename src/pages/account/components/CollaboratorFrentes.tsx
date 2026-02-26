import { useState, useMemo, useEffect } from 'react';
import { FrenteDto } from '@/dtos/content/contentDtoInput';
import { getMaterias } from '@/services/content/getMaterias';
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Filtrar frentes disponíveis por busca
  const filteredFrentes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return availableFrentes.slice(0, 10); // Limitar a 10 resultados quando não há busca
    }
    return availableFrentes.filter((frente) =>
      (frente.nome ?? "").toLowerCase().includes(term)
    );
  }, [availableFrentes, searchTerm]);

  const handleSelect = (frente: FrenteDto) => {
    selectFrente(frente.id);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemove = (frenteId: string) => {
    removeFrente(frenteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frentes de Afinidade
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Selecione as frentes com as quais você tem mais afinidade. Busque pelo nome e selecione da lista.
        </p>

        {/* Input de busca e seleção */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar e selecionar frentes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full"
          />

          {/* Dropdown customizado */}
          {showDropdown && filteredFrentes.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredFrentes.map((frente) => (
                  <button
                    key={frente.id}
                    type="button"
                    onClick={() => handleSelect(frente)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <div className="font-medium text-sm">{frente.nome ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {materiaNomeMap[frente.materia] ?? frente.materia}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {showDropdown && searchTerm && filteredFrentes.length === 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                <p className="text-sm text-gray-500">
                  Nenhuma frente encontrada com "{searchTerm}"
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Frentes selecionadas */}
      {selectedFrentes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frentes Selecionadas ({selectedFrentes.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedFrentes.map((frente) => (
              <Badge
                key={frente.id}
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                <span className="text-sm">{frente.nome ?? "—"}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(frente.id)}
                  className="ml-1 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
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
        <div className="text-sm text-gray-500 italic">
          Nenhuma frente selecionada ainda. Use o campo acima para buscar e selecionar.
        </div>
      )}
    </div>
  );
}


