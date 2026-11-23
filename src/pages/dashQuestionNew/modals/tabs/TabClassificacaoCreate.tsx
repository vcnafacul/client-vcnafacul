import { Spinner } from "@/components/ui/spinner";
import type { FrenteOption, InfosDaQuestao, MateriaOption } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/types";
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
import { AlertCircle, AlertTriangle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { areasPermitidas, mantemArea } from "./areasPermitidas";

interface TabClassificacaoCreateProps {
  formData: Partial<CreateQuestion>;
  errors: Record<string, string>;
  infos?: InfosDaQuestao | null;
  onChange: (field: keyof CreateQuestion, value: CreateQuestion[keyof CreateQuestion]) => void;
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

  const [materiasDisponiveis, setMateriasDisponiveis] = useState<MateriaOption[]>([]);
  const [frentesDisponiveis, setFrentesDisponiveis] = useState<FrenteOption[]>([]);
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
          // Limpar numero se o selecionado não está mais disponível
          if (formData.numero != null && !numeros.includes(formData.numero)) {
            onChange("numero", null);
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

  /*
    ⚠️ **A área não depende mais de haver prova** (card 02 de
    `area-enem-da-questao`). Sem prova, ou em prova customizada (`enemAreas =
    []`), as 4 áreas; prova ENEM filtra para as do dia. Antes, a customizada
    deixava o select vazio e desabilitado — e a área é obrigatória: não
    salvava.
  */
  const provaDe = (id?: string) =>
    infos?.provas?.find((p) => p._id === id);
  const provaSelecionada = provaDe(formData.prova);
  const { areas: enemAreasDisponiveis } = areasPermitidas(
    provaSelecionada ? [provaSelecionada] : []
  );

  // Atualizar matérias quando área ENEM for selecionada
  useEffect(() => {
    if (formData.enemArea) {
      const materias =
        infos?.materias?.filter(
          (mat) => mat.enemArea === formData.enemArea
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
        (m) => m._id === formData.materia
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
    onChange("numero", null);
    /*
      ⚠️ **Só limpa a classificação se a área deixou de caber na prova nova.**
      Antes limpava sempre — corrigir a prova escolhida custava reclassificar.
    */
    const nova = provaDe(value);
    if (!mantemArea(formData.enemArea, nova ? [nova] : [])) {
      onChange("enemArea", "");
      onChange("materia", "");
      onChange("frente1", "");
      onChange("frente2", null);
      onChange("frente3", null);
      setShowFrente2(false);
      setShowFrente3(false);
    }
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
    <div className="space-y-6 p-2 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">📋 Informações da Prova</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prova */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {/*
                  ⚠️ **Opcional** (card 03 de `area-enem-da-questao`): sem
                  prova, a questão só é gravada e entra numa prova depois, pela
                  Classificação. O select do Radix não tem item vazio — por
                  isso o botão para desfazer a escolha.
                */}
                <label htmlFor="tabclassificacaocreate-prova-opcional" className="text-body font-semibold text-muted-foreground">
                  Prova <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                {formData.prova && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-sem-prova
                    onClick={() => handleProvaChange("")}
                    className="h-6 px-2 text-caption"
                  >
                    Sem prova
                  </Button>
                )}
              </div>
              <Select value={formData.prova} onValueChange={handleProvaChange}>
                <SelectTrigger id="tabclassificacaocreate-prova-opcional" className={errors.prova ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a prova" />
                </SelectTrigger>
                <SelectContent>
                  {infos?.provas?.map((prova) => (
                    <SelectItem key={prova._id} value={prova._id}>
                      {prova.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prova && (
                <p className="text-body text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.prova}
                </p>
              )}
            </div>

            {/* Número */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tabclassificacaocreate-numero-da-questao" className="text-body font-semibold text-muted-foreground">
                  Número da Questão
                </label>
                {formData.numero != null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange("numero", null)}
                    className="h-6 px-2 text-caption text-destructive border-destructive hover:text-destructive hover:bg-destructive-muted"
                  >
                    Remover número
                  </Button>
                )}
              </div>
              {loadingNumeros ? (
                <div className="flex items-center justify-center p-3 border border-border rounded-md bg-page">
                  <Spinner size="inline" decorative className="mr-2 text-primary" />
                  <span className="text-body text-muted-foreground">
                    Carregando números disponíveis...
                  </span>
                </div>
              ) : numerosDisponiveis.length === 0 && formData.prova ? (
                <div className="p-3 bg-warning-muted border border-warning/30 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-body font-semibold text-warning">
                        Impossível cadastrar nova questão
                      </p>
                      <p className="text-caption text-warning mt-1">
                        Não há números disponíveis para esta prova. Todas as
                        questões já foram cadastradas.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Select
                  value={formData.numero != null ? formData.numero.toString() : undefined}
                  onValueChange={(value) => onChange("numero", parseInt(value))}
                  disabled={!formData.prova || numerosDisponiveis.length === 0}
                >
                  <SelectTrigger id="tabclassificacaocreate-numero-da-questao"
                    className={errors.numero ? "border-destructive" : ""}
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
                <p className="text-body text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.numero}
                </p>
              )}
            </div>

            {/* Área ENEM */}
            <div className="space-y-2">
              <label htmlFor="tabclassificacaocreate-area-do-conhecimento-enem" className="text-body font-semibold text-muted-foreground">
                Área do Conhecimento ENEM *
              </label>
              <Select
                value={formData.enemArea}
                onValueChange={handleEnemAreaChange}
              >
                <SelectTrigger id="tabclassificacaocreate-area-do-conhecimento-enem"
                  className={errors.enemArea ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Selecione a área" />
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
                <p className="text-body text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.enemArea}
                </p>
              )}
            </div>

            {/* Disciplina */}
            <div className="space-y-2">
              <label htmlFor="tabclassificacaocreate-disciplina" className="text-body font-semibold text-muted-foreground">
                Disciplina *
              </label>
              <Select
                value={formData.materia}
                onValueChange={handleMateriaChange}
                disabled={
                  !formData.enemArea || materiasDisponiveis.length === 0
                }
              >
                <SelectTrigger id="tabclassificacaocreate-disciplina"
                  className={errors.materia ? "border-destructive" : ""}
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
                <p className="text-body text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.materia}
                </p>
              )}
            </div>

            {/* Frente Principal */}
            <div className="space-y-2">
              <label htmlFor="tabclassificacaocreate-frente-principal" className="text-body font-semibold text-muted-foreground">
                Frente Principal *
              </label>
              <Select
                value={formData.frente1}
                onValueChange={(value) => onChange("frente1", value)}
                disabled={!formData.materia || frentesDisponiveis.length === 0}
              >
                <SelectTrigger id="tabclassificacaocreate-frente-principal"
                  className={errors.frente1 ? "border-destructive" : ""}
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
                <p className="text-body text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.frente1}
                </p>
              )}
            </div>

            {/* Frente Secundária */}
            {showFrente2 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="tabclassificacaocreate-frente-secundaria" className="text-body font-semibold text-muted-foreground">
                    Frente Secundária
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFrente2}
                    className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive-muted"
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
                  <SelectTrigger id="tabclassificacaocreate-frente-secundaria">
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
                <span className="text-body font-semibold text-muted-foreground">
                  Frente Secundária
                </span>
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
                  <label htmlFor="tabclassificacaocreate-frente-terciaria" className="text-body font-semibold text-muted-foreground">
                    Frente Terciária
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFrente3}
                    className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive-muted"
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
                  <SelectTrigger id="tabclassificacaocreate-frente-terciaria">
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
                <span className="text-body font-semibold text-muted-foreground">
                  Frente Terciária
                </span>
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
