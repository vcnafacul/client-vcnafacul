import { FrenteDto } from "@/dtos/content/contentDtoInput";
import { getCollaboratorFrentes } from "@/services/auth/getCollaboratorFrentes";
import { getFrentes } from "@/services/content/getFrentes";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFrentesSelectionOptions {
  token: string;
  initialSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

function normalizeId(id: string | number): string {
  return id != null ? String(id) : "";
}

export function useFrentesSelection({
  token,
  initialSelectedIds = [],
  onSelectionChange,
}: UseFrentesSelectionOptions) {
  const [allFrentes, setAllFrentes] = useState<FrenteDto[]>([]);
  const [selectedFrentesIds, setSelectedFrentesIds] = useState<string[]>(() =>
    initialSelectedIds.map(normalizeId).filter(Boolean),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSelected, setIsLoadingSelected] = useState(true);

  // Sincronizar com initialSelectedIds quando mudar (ex.: modal passa novo selectedIds)
  useEffect(() => {
    const next = initialSelectedIds.map(normalizeId).filter(Boolean);
    setSelectedFrentesIds((prev) =>
      prev.length !== next.length || next.some((id, i) => prev[i] !== id) ? next : prev
    );
  }, [initialSelectedIds]);

  // Buscar frentes selecionadas do colaborador (apenas na primeira carga, se não houver initialSelectedIds)
  useEffect(() => {
    const loadSelectedFrentes = async () => {
      try {
        setIsLoadingSelected(true);
        const rawIds = await getCollaboratorFrentes(token);
        const selectedIds = rawIds.map(normalizeId).filter(Boolean);
        if (!initialSelectedIds || initialSelectedIds.length === 0) {
          setSelectedFrentesIds((prev) => {
            // Não sobrescrever se o usuário já selecionou algo enquanto a requisição rodava
            if (prev.length > 0) return prev;
            onSelectionChange?.(selectedIds);
            return selectedIds;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar frentes selecionadas:", error);
      } finally {
        setIsLoadingSelected(false);
      }
    };

    if (token && (!initialSelectedIds || initialSelectedIds.length === 0)) {
      loadSelectedFrentes();
    } else {
      setIsLoadingSelected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Buscar todas as frentes de todas as matérias
  useEffect(() => {
    const loadAllFrentes = async () => {
      try {
        setIsLoading(true);
        const frentes = await getFrentes(token); // Busca todas as frentes

        setAllFrentes(frentes);
      } catch (error) {
        console.error("Erro ao carregar frentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadAllFrentes();
    }
  }, [token]);

  const selectedIdsSet = useMemo(
    () => new Set(selectedFrentesIds),
    [selectedFrentesIds],
  );

  // Frentes disponíveis (não selecionadas) — comparação por id em string
  const availableFrentes = useMemo(() => {
    return allFrentes.filter(
      (frente) => !selectedIdsSet.has(normalizeId(frente.id)),
    );
  }, [allFrentes, selectedIdsSet]);

  // Frentes selecionadas (com dados completos) — comparação por id em string
  const selectedFrentes = useMemo(() => {
    return allFrentes.filter((frente) =>
      selectedIdsSet.has(normalizeId(frente.id)),
    );
  }, [allFrentes, selectedIdsSet]);

  const selectFrente = useCallback(
    (frenteId: string | number) => {
      const id = normalizeId(frenteId);
      if (!id) return;
      setSelectedFrentesIds((prev) => {
        if (prev.includes(id)) return prev;
        const newIds = [...prev, id];
        onSelectionChange?.(newIds);
        return newIds;
      });
    },
    [onSelectionChange],
  );

  const removeFrente = useCallback(
    (frenteId: string | number) => {
      const id = normalizeId(frenteId);
      setSelectedFrentesIds((prev) => {
        const newIds = prev.filter((i) => i !== id);
        onSelectionChange?.(newIds);
        return newIds;
      });
    },
    [onSelectionChange],
  );

  const hasChanges = useMemo(() => {
    const initialSet = new Set(initialSelectedIds.map(normalizeId).filter(Boolean));
    const currentSet = new Set(selectedFrentesIds);

    if (initialSet.size !== currentSet.size) return true;
    return ![...initialSet].every((id) => currentSet.has(id));
  }, [initialSelectedIds, selectedFrentesIds]);

  const initialIdsNormalized = useMemo(
    () => initialSelectedIds.map(normalizeId).filter(Boolean),
    [initialSelectedIds],
  );

  return {
    availableFrentes,
    selectedFrentes,
    selectedFrentesIds,
    isLoading: isLoading || isLoadingSelected,
    hasChanges,
    selectFrente,
    removeFrente,
    reset: () => {
      setSelectedFrentesIds(initialIdsNormalized);
      onSelectionChange?.(initialIdsNormalized);
    },
  };
}
