import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Filter, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { FiltroDeRevisoes } from "./FiltroDeRevisoes";
import {
  ajustarCascata,
  FILTROS_VAZIOS,
  FilterValues,
  OPCOES_DE_ANULADA,
  opcoesDoFiltro,
  ProvaDoFiltro,
  RevisaoDoFiltro,
  temFiltroAtivo,
} from "./filtrosDoBanco";

// tickets/043: o tipo mora em `filtrosDoBanco`; reexportado para quem já importava daqui.
export type { FilterValues, FiltroDeAnulada } from "./filtrosDoBanco";

interface QuestionFiltersProps {
  infos: any;
  onFilter: (filters: FilterValues) => void;
  isLoading?: boolean;
}


export function QuestionFilters({
  infos,
  onFilter,
  isLoading = false,
}: QuestionFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(FILTROS_VAZIOS);
  const provasDoFiltro: ProvaDoFiltro[] = infos?.provas ?? [];
  const opcoes = opcoesDoFiltro(provasDoFiltro, filters);

  const [materiasFiltradas, setMateriasFiltradas] = useState<any[]>([]);
  const [frentesFiltradas, setFrentesFiltradas] = useState<any[]>([]);

  // Extrair áreas ENEM únicas de todas as provas
  const enemAreasDisponiveis = Array.from(
    new Set(infos?.provas?.flatMap((prova: any) => prova.enemAreas || []) || [])
  ).sort() as string[];

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    let newFilters = { ...filters, [key]: value } as FilterValues;

    // tickets/043: Exame → Categoria → Prova. Trocar exame/categoria limpa o
    // que deixou de casar (e, se a prova sair, Área/Matéria/Frente com ela).
    if (key === "exame" || key === "categoria" || key === "ano") {
      newFilters = ajustarCascata(newFilters, provasDoFiltro);
      if (!newFilters.prova && filters.prova) {
        setMateriasFiltradas([]);
        setFrentesFiltradas([]);
      }
    }

    // Lógica de cascata
    if (key === "enemArea") {
      // Filtrar matérias pela área ENEM
      const materias = (
        infos?.materias?.filter((mat: any) => mat.enemArea === value) || []
      ).sort((a: any, b: any) => a.nome.localeCompare(b.nome, "pt-BR"));
      setMateriasFiltradas(materias);
      newFilters.materia = "";
      newFilters.frente = "";
      setFrentesFiltradas([]);
    }

    if (key === "materia") {
      // Filtrar frentes pela matéria
      const materia = infos?.materias?.find((m: any) => m._id === value);
      setFrentesFiltradas(
        (materia?.frentes || []).sort((a: any, b: any) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        )
      );
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
    const clearedFilters: FilterValues = FILTROS_VAZIOS;
    setFilters(clearedFilters);
    setMateriasFiltradas([]);
    setFrentesFiltradas([]);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = temFiltroAtivo(filters);

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

          {/* tickets/042, card 08 — rótulo e opções revistos no 043 */}
          <div className="space-y-2">
            <Label htmlFor="anulada">Questões anuladas</Label>
            <Select
              value={filters.anulada}
              onValueChange={(value) => handleFilterChange("anulada", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="anulada">
                <SelectValue placeholder="Mostrar" />
              </SelectTrigger>
              <SelectContent>
                {OPCOES_DE_ANULADA.map((o) => (
                  <SelectItem key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* tickets/043: Exame → Categoria → Prova */}
          <div className="space-y-2">
            <Label htmlFor="exame">Exame</Label>
            <Select
              key={`exame-${filters.exame}`}
              value={filters.exame || undefined}
              onValueChange={(value) => handleFilterChange("exame", value)}
              disabled={isLoading || opcoes.exames.length === 0}
            >
              <SelectTrigger id="exame">
                <SelectValue placeholder="Todos os exames" />
              </SelectTrigger>
              <SelectContent>
                {opcoes.exames.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              key={`categoria-${filters.categoria}`}
              value={filters.categoria || undefined}
              onValueChange={(value) => handleFilterChange("categoria", value)}
              disabled={isLoading || opcoes.categorias.length === 0}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                {/* tickets/043, card 07: system → cursinho → meu cursinho */}
                {opcoes.gruposDeCategorias.map((g) => (
                  <SelectGroup key={g.grupo}>
                    <SelectLabel className="text-xs text-muted-foreground">{g.titulo}</SelectLabel>
                    {g.itens.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* tickets/043, card 09: ano da prova — filtra a lista de Provas */}
          <div className="space-y-2">
            <Label htmlFor="ano">Ano</Label>
            <Select
              key={`ano-${filters.ano}`}
              value={filters.ano || undefined}
              onValueChange={(value) => handleFilterChange("ano", value)}
              disabled={isLoading || opcoes.anos.length === 0}
            >
              <SelectTrigger id="ano">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                {opcoes.anos.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prova */}
          <div className="space-y-2">
            <Label htmlFor="prova">Prova</Label>
            <Select
              key={`prova-${filters.prova}`}
              value={filters.prova || undefined}
              onValueChange={(value) => handleFilterChange("prova", value)}
              disabled={isLoading || opcoes.provas.length === 0}
            >
              <SelectTrigger id="prova">
                <SelectValue placeholder="Todas as provas" />
              </SelectTrigger>
              <SelectContent>
                {opcoes.provas.map((prova) => (
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
          {/* tickets/043: revisões necessárias (em "e") e imagem */}
          <div className="space-y-2">
            <Label htmlFor="revisoes">Revisões necessárias</Label>
            <FiltroDeRevisoes
              value={filters.revisoes}
              onChange={(revisoes: RevisaoDoFiltro[]) => setFilters({ ...filters, revisoes })}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end">
            <label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                id="semImagem"
                checked={filters.semImagem}
                onCheckedChange={(v) => setFilters({ ...filters, semImagem: v === true })}
                disabled={isLoading}
              />
              Questões sem imagem
            </label>
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
