import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { getMissingNumber } from "@/services/prova/getMissingNumber";
import { useAuthStore } from "@/store/auth";
import { AlertCircle, AlertTriangle, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TabClassificacaoCreateProps {
  formData: Partial<CreateQuestion>;
  errors: Record<string, string>;
  infos: any;
  onChange: (field: keyof CreateQuestion, value: any) => void;
}

export function TabClassificacaoCreate({
  formData,
  errors,
  infos,
  onChange,
}: TabClassificacaoCreateProps) {
  const {
    data: { token },
  } = useAuthStore();

  const [enemAreasDisponiveis, setEnemAreasDisponiveis] = useState<string[]>(
    []
  );
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<any[]>([]);
  const [frentesDisponiveis, setFrentesDisponiveis] = useState<any[]>([]);
  const [showFrente2, setShowFrente2] = useState(false);
  const [showFrente3, setShowFrente3] = useState(false);
  const [numerosDisponiveis, setNumerosDisponiveis] = useState<number[]>([]);
  const [loadingNumeros, setLoadingNumeros] = useState(false);

  // Buscar números disponíveis quando prova for selecionada
  useEffect(() => {
    const fetchNumerosDisponiveis = async () => {
      if (formData.prova) {
        setLoadingNumeros(true);
        try {
          const numeros = await getMissingNumber(formData.prova, token);
          setNumerosDisponiveis(numeros);
          // Limpar o número selecionado se não estiver mais disponível
          if (formData.numero && !numeros.includes(formData.numero)) {
            onChange("numero", numeros[0] || 1);
          } else if (numeros.length > 0 && !formData.numero) {
            onChange("numero", numeros[0]);
          }
        } catch (error) {
          console.error("Erro ao buscar números disponíveis:", error);
          setNumerosDisponiveis([]);
        } finally {
          setLoadingNumeros(false);
        }
      } else {
        setNumerosDisponiveis([]);
      }
    };

    fetchNumerosDisponiveis();
  }, [formData.prova, token]);

  // Atualizar áreas ENEM quando prova for selecionada
  useEffect(() => {
    if (formData.prova) {
      const prova = infos?.provas?.find((p: any) => p._id === formData.prova);
      setEnemAreasDisponiveis(prova?.enemAreas || []);
    } else {
      setEnemAreasDisponiveis([]);
    }
  }, [formData.prova, infos]);

  // Atualizar matérias quando área ENEM for selecionada
  useEffect(() => {
    if (formData.enemArea) {
      const materias =
        infos?.materias?.filter(
          (mat: any) => mat.enemArea === formData.enemArea
        ) || [];
      setMateriasDisponiveis(materias);
    } else {
      setMateriasDisponiveis([]);
    }
  }, [formData.enemArea, infos]);

  // Atualizar frentes quando matéria for selecionada
  useEffect(() => {
    if (formData.materia) {
      const materia = infos?.materias?.find(
        (m: any) => m._id === formData.materia
      );
      setFrentesDisponiveis(materia?.frentes || []);
    } else {
      setFrentesDisponiveis([]);
    }
  }, [formData.materia, infos]);

  // Mostrar frentes secundária e terciária se já tiverem valores
  useEffect(() => {
    if (formData.frente2) {
      setShowFrente2(true);
    }
    if (formData.frente3) {
      setShowFrente3(true);
    }
  }, [formData.frente2, formData.frente3]);

  const handleProvaChange = (value: string) => {
    onChange("prova", value);
    // Limpar campos dependentes
    onChange("numero", 1); // Reset numero também
    onChange("enemArea", "");
    onChange("materia", "");
    onChange("frente1", "");
    onChange("frente2", null);
    onChange("frente3", null);
    setShowFrente2(false);
    setShowFrente3(false);
  };

  const handleEnemAreaChange = (value: string) => {
    onChange("enemArea", value);
    // Limpar campos dependentes
    onChange("materia", "");
    onChange("frente1", "");
    onChange("frente2", null);
    onChange("frente3", null);
    setShowFrente2(false);
    setShowFrente3(false);
  };

  const handleMateriaChange = (value: string) => {
    onChange("materia", value);
    // Limpar campos dependentes
    onChange("frente1", "");
    onChange("frente2", null);
    onChange("frente3", null);
    setShowFrente2(false);
    setShowFrente3(false);
  };

  const handleAddFrente2 = () => {
    setShowFrente2(true);
  };

  const handleRemoveFrente2 = () => {
    setShowFrente2(false);
    onChange("frente2", null);
    // Se remover frente2, também remove frente3
    if (showFrente3) {
      setShowFrente3(false);
      onChange("frente3", null);
    }
  };

  const handleAddFrente3 = () => {
    setShowFrente3(true);
  };

  const handleRemoveFrente3 = () => {
    setShowFrente3(false);
    onChange("frente3", null);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Informações da Prova</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prova */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Prova *
              </label>
              <Select value={formData.prova} onValueChange={handleProvaChange}>
                <SelectTrigger className={errors.prova ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a prova" />
                </SelectTrigger>
                <SelectContent>
                  {infos?.provas?.map((prova: any) => (
                    <SelectItem key={prova._id} value={prova._id}>
                      {prova.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prova && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.prova}
                </p>
              )}
            </div>

            {/* Número */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Número da Questão *
              </label>
              {loadingNumeros ? (
                <div className="flex items-center justify-center p-3 border border-gray-200 rounded-md bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                  <span className="text-sm text-gray-600">
                    Carregando números disponíveis...
                  </span>
                </div>
              ) : numerosDisponiveis.length === 0 && formData.prova ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Impossível cadastrar nova questão
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Não há números disponíveis para esta prova. Todas as
                        questões já foram cadastradas.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Select
                  value={formData.numero?.toString()}
                  onValueChange={(value) => onChange("numero", parseInt(value))}
                  disabled={!formData.prova || numerosDisponiveis.length === 0}
                >
                  <SelectTrigger
                    className={errors.numero ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        !formData.prova
                          ? "Selecione uma prova primeiro"
                          : "Selecione o número"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {numerosDisponiveis.map((numero) => (
                      <SelectItem key={numero} value={numero.toString()}>
                        Questão {numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.numero && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.numero}
                </p>
              )}
            </div>

            {/* Área ENEM */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Área do Conhecimento ENEM *
              </label>
              <Select
                value={formData.enemArea}
                onValueChange={handleEnemAreaChange}
                disabled={!formData.prova || enemAreasDisponiveis.length === 0}
              >
                <SelectTrigger
                  className={errors.enemArea ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.prova
                        ? "Selecione uma prova primeiro"
                        : "Selecione a área"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {enemAreasDisponiveis.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.enemArea && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.enemArea}
                </p>
              )}
            </div>

            {/* Disciplina */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Disciplina *
              </label>
              <Select
                value={formData.materia}
                onValueChange={handleMateriaChange}
                disabled={
                  !formData.enemArea || materiasDisponiveis.length === 0
                }
              >
                <SelectTrigger
                  className={errors.materia ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.enemArea
                        ? "Selecione uma área primeiro"
                        : "Selecione a disciplina"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {materiasDisponiveis.map((mat) => (
                    <SelectItem key={mat._id} value={mat._id}>
                      {mat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.materia && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.materia}
                </p>
              )}
            </div>

            {/* Frente Principal */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Frente Principal *
              </label>
              <Select
                value={formData.frente1}
                onValueChange={(value) => onChange("frente1", value)}
                disabled={!formData.materia || frentesDisponiveis.length === 0}
              >
                <SelectTrigger
                  className={errors.frente1 ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.materia
                        ? "Selecione uma disciplina primeiro"
                        : "Selecione a frente"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {frentesDisponiveis.map((frente) => (
                    <SelectItem key={frente._id} value={frente._id}>
                      {frente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frente1 && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.frente1}
                </p>
              )}
            </div>

            {/* Frente Secundária */}
            {showFrente2 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-600">
                    Frente Secundária
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFrente2}
                    className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Select
                  value={formData.frente2 || undefined}
                  onValueChange={(value) => onChange("frente2", value)}
                  disabled={
                    !formData.materia || frentesDisponiveis.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frente" />
                  </SelectTrigger>
                  <SelectContent>
                    {frentesDisponiveis.map((frente) => (
                      <SelectItem key={frente._id} value={frente._id}>
                        {frente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">
                  Frente Secundária
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddFrente2}
                  disabled={
                    !formData.frente1 || frentesDisponiveis.length === 0
                  }
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Frente Secundária
                </Button>
              </div>
            )}

            {/* Frente Terciária */}
            {showFrente3 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-600">
                    Frente Terciária
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFrente3}
                    className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Select
                  value={formData.frente3 || undefined}
                  onValueChange={(value) => onChange("frente3", value)}
                  disabled={
                    !formData.materia || frentesDisponiveis.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frente" />
                  </SelectTrigger>
                  <SelectContent>
                    {frentesDisponiveis.map((frente) => (
                      <SelectItem key={frente._id} value={frente._id}>
                        {frente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : showFrente2 ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">
                  Frente Terciária
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddFrente3}
                  disabled={
                    !formData.frente2 || frentesDisponiveis.length === 0
                  }
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Frente Terciária
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
