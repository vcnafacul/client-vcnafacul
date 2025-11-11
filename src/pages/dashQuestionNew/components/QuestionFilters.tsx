import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Filter, RotateCcw, Search } from "lucide-react";
import { useState } from "react";

interface QuestionFiltersProps {
  infos: any;
  onFilter: (filters: FilterValues) => void;
  isLoading?: boolean;
}

export interface FilterValues {
  status: StatusEnum;
  materia: string;
  frente: string;
  prova: string;
  enemArea: string;
  filterText: string;
}

export function QuestionFilters({
  infos,
  onFilter,
  isLoading = false,
}: QuestionFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: StatusEnum.All,
    materia: "",
    frente: "",
    prova: "",
    enemArea: "",
    filterText: "",
  });

  const [materiasFiltradas, setMateriasFiltradas] = useState<any[]>([]);
  const [frentesFiltradas, setFrentesFiltradas] = useState<any[]>([]);

  // Extrair áreas ENEM únicas de todas as provas
  const enemAreasDisponiveis = Array.from(
    new Set(infos?.provas?.flatMap((prova: any) => prova.enemAreas || []) || [])
  ).sort() as string[];

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };

    // Lógica de cascata
    if (key === "enemArea") {
      // Filtrar matérias pela área ENEM
      const materias =
        infos?.materias?.filter((mat: any) => mat.enemArea === value) || [];
      setMateriasFiltradas(materias);
      newFilters.materia = "";
      newFilters.frente = "";
      setFrentesFiltradas([]);
    }

    if (key === "materia") {
      // Filtrar frentes pela matéria
      const materia = infos?.materias?.find((m: any) => m._id === value);
      setFrentesFiltradas(materia?.frentes || []);
      newFilters.frente = "";
    }

    if (key === "prova") {
      // Limpar área ENEM, matéria e frente ao trocar prova
      newFilters.enemArea = "";
      newFilters.materia = "";
      newFilters.frente = "";
      setMateriasFiltradas([]);
      setFrentesFiltradas([]);
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      status: StatusEnum.All,
      materia: "",
      frente: "",
      prova: "",
      enemArea: "",
      filterText: "",
    };
    setFilters(clearedFilters);
    setMateriasFiltradas([]);
    setFrentesFiltradas([]);
    onFilter(clearedFilters);
  };

  const hasActiveFilters =
    filters.status !== StatusEnum.All ||
    filters.materia ||
    filters.frente ||
    filters.prova ||
    filters.enemArea ||
    filters.filterText;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtros de Busca</h3>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground">
              (Filtros ativos)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Busca por Texto */}
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="search">Buscar questão</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite para buscar..."
                value={filters.filterText}
                onChange={(e) =>
                  handleFilterChange("filterText", e.target.value)
                }
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status.toString()}
              onValueChange={(value) => handleFilterChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StatusEnum.All.toString()}>Todos</SelectItem>
                <SelectItem value={StatusEnum.Pending.toString()}>
                  ⏳ Pendente
                </SelectItem>
                <SelectItem value={StatusEnum.Approved.toString()}>
                  ✅ Aprovada
                </SelectItem>
                <SelectItem value={StatusEnum.Rejected.toString()}>
                  ❌ Rejeitada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prova */}
          <div className="space-y-2">
            <Label htmlFor="prova">Prova</Label>
            <Select
              value={filters.prova}
              onValueChange={(value) => handleFilterChange("prova", value)}
              disabled={isLoading || !infos?.provas?.length}
            >
              <SelectTrigger id="prova">
                <SelectValue placeholder="Todas as provas" />
              </SelectTrigger>
              <SelectContent>
                {infos?.provas?.map((prova: any) => (
                  <SelectItem key={prova._id} value={prova._id}>
                    {prova.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Área ENEM */}
          <div className="space-y-2">
            <Label htmlFor="enemArea">Área ENEM</Label>
            <Select
              value={filters.enemArea}
              onValueChange={(value) => handleFilterChange("enemArea", value)}
              disabled={isLoading || enemAreasDisponiveis.length === 0}
            >
              <SelectTrigger id="enemArea">
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                {enemAreasDisponiveis.map((area: string) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Matéria */}
          <div className="space-y-2">
            <Label htmlFor="materia">Matéria</Label>
            <Select
              value={filters.materia}
              onValueChange={(value) => handleFilterChange("materia", value)}
              disabled={
                isLoading || !filters.enemArea || materiasFiltradas.length === 0
              }
            >
              <SelectTrigger id="materia">
                <SelectValue
                  placeholder={
                    filters.enemArea
                      ? "Selecione uma matéria"
                      : "Selecione uma área primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {materiasFiltradas.map((materia: any) => (
                  <SelectItem key={materia._id} value={materia._id}>
                    {materia.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frente */}
          <div className="space-y-2">
            <Label htmlFor="frente">Frente</Label>
            <Select
              value={filters.frente}
              onValueChange={(value) => handleFilterChange("frente", value)}
              disabled={
                isLoading || !filters.materia || frentesFiltradas.length === 0
              }
            >
              <SelectTrigger id="frente">
                <SelectValue
                  placeholder={
                    filters.materia
                      ? "Selecione uma frente"
                      : "Selecione uma matéria primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {frentesFiltradas.map((frente: any) => (
                  <SelectItem key={frente._id} value={frente._id}>
                    {frente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="flex-1 md:flex-initial"
          >
            <Search className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            disabled={isLoading || !hasActiveFilters}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
