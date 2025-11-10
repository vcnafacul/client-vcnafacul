import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateStatus } from "@/services/question/updateStatus";
import { useAuthStore } from "@/store/auth";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Loader2,
  RefreshCw,
  Save,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { TabClassificacaoProps } from "./types";
import { useClassificacaoForm } from "./useClassificacaoForm";

/**
 * Tab de Classificação - Modo View e Edit
 *
 * Features:
 * - Visualização de dados de classificação
 * - Edição inline com validação
 * - Salvamento independente (apenas esta tab)
 * - Indicadores visuais de estado (editando, não salvo, salvando)
 * - Flags de revisão necessária
 */
export function TabClassificacao({
  question,
  infos,
  canEdit = false,
}: TabClassificacaoProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const {
    form,
    control,
    register,
    isEditing,
    isSaving,
    isDirty,
    isValid,
    errors,
    handleEdit,
    handleSave,
    handleCancel,
  } = useClassificacaoForm({ question });

  // Estados para gerenciamento de status
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  // Observar valores do formulário para cascata
  const provaId = form.watch("prova");
  const enemArea = form.watch("enemArea");
  const materiaId = form.watch("materia");

  // Buscar prova selecionada
  const provaSelecionada = infos?.provas?.find((p) => p._id === provaId);

  // Filtrar áreas ENEM baseado na prova selecionada
  const enemAreasDisponiveis = provaSelecionada?.enemAreas || [];

  // Filtrar matérias baseado na área ENEM selecionada
  const materiasDisponiveis =
    infos?.materias?.filter((mat) => mat.enemArea === enemArea) || [];

  // Buscar matéria selecionada para pegar suas frentes
  const materiaSelecionada = infos?.materias?.find((m) => m._id === materiaId);
  const frentesDisponiveis = materiaSelecionada?.frentes || [];

  // Para visualização: buscar dados originais da questão
  const provaOriginal = infos?.provas?.find((p) => p._id === question.prova);
  const materiaOriginal = infos?.materias?.find(
    (m) => m._id === question.materia
  );

  // Função para atualizar o status da questão
  const handleStatusUpdate = async (
    newStatus: StatusEnum,
    message?: string
  ) => {
    setIsUpdatingStatus(true);
    await executeAsync({
      action: () => updateStatus(question._id, newStatus, token, message),
      loadingMessage: "Atualizando status...",
      successMessage: "✅ Status atualizado com sucesso!",
      errorMessage: "Erro ao atualizar status",
      onSuccess: () => {
        // Atualizar o status localmente
        question.status = newStatus;
        setShowRejectionInput(false);
        setRejectionMessage("");
      },
      onFinally: () => setIsUpdatingStatus(false),
    });
  };

  // Handler para aprovar questão
  const handleApprove = () => {
    if (confirm("Tem certeza que deseja aprovar esta questão?")) {
      handleStatusUpdate(StatusEnum.Approved);
    }
  };

  // Handler para rejeitar questão
  const handleReject = () => {
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    if (confirm("Tem certeza que deseja rejeitar esta questão?")) {
      handleStatusUpdate(StatusEnum.Rejected, rejectionMessage || undefined);
    }
  };

  // Obter cor e label do status
  const getStatusDisplay = () => {
    switch (question.status) {
      case StatusEnum.Approved:
        return {
          label: "Aprovada",
          color: "text-green-600 bg-green2/5 border-green2/50",
          icon: "✅",
        };
      case StatusEnum.Pending:
        return {
          label: "Pendente",
          color: "text-amber-600 bg-amber-50/50 border-amber-200/50",
          icon: "⏳",
        };
      case StatusEnum.Rejected:
        return {
          label: "Rejeitada",
          color: "text-red-600 bg-red/5 border-red/50",
          icon: "❌",
        };
      default:
        return {
          label: "Indefinido",
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: "❓",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex flex-col gap-4 justify-around">
      {/* Gerenciamento de Status */}
      {canEdit && (
        <Card className="pt-6">
          <CardContent className="flex flex-col gap-4">
            {/* Status Atual */}
            <div className={`p-4 rounded-lg border-2 ${statusDisplay.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{statusDisplay.icon}</span>
                  <div>
                    <p className="text-sm font-medium opacity-75">
                      Status atual
                    </p>
                    <p className="text-lg font-bold">{statusDisplay.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input de mensagem de rejeição (condicional) */}
            {showRejectionInput && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">
                  Motivo da Rejeição (opcional)
                </label>
                <Textarea
                  value={rejectionMessage}
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="w-full flex gap-3">
              {/* Botão Aprovar */}
              {!(question.status === StatusEnum.Approved) && (
                <Button
                  onClick={handleApprove}
                  disabled={isUpdatingStatus}
                  className="bg-green2/5 border border-green2 hover:bg-green2/10 text-green2 w-full"
                  variant="default"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Aprovar
                </Button>
              )}
              {/* Botão Rejeitar */}
              {!(question.status === StatusEnum.Rejected) && (
                <Button
                  onClick={handleReject}
                  disabled={isUpdatingStatus}
                  className="bg-red/5 hover:bg-red/10 text-red border-red border w-full"
                  variant="default"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {showRejectionInput ? "Confirmar Rejeição" : "Rejeitar"}
                </Button>
              )}
            </div>

            {/* Cancelar rejeição */}
            {showRejectionInput && (
              <Button
                onClick={() => {
                  setShowRejectionInput(false);
                  setRejectionMessage("");
                }}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Cancelar
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      {/* Informações Principais */}
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">📋 Informações da Prova</CardTitle>
            {isEditing && (
              <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Modo Edição
              </span>
            )}
            {isDirty && !isEditing && (
              <span className="text-sm font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded">
                • Alterações não salvas
              </span>
            )}
          </div>

          {/* Botão Editar (aparece só no modo visualização) */}
          {!isEditing && canEdit && (
            <Button size="sm" variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Classificação
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prova */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Prova *
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base">{provaOriginal?.nome}</p>
                </div>
              ) : (
                <Controller
                  name="prova"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Resetar campos dependentes quando prova muda
                        form.setValue("enemArea", "");
                        form.setValue("materia", "");
                        form.setValue("frente1", "");
                      }}
                    >
                      <SelectTrigger
                        className={errors.prova ? "border-red-500" : ""}
                      >
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
                  )}
                />
              )}
              {errors.prova && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.prova.message}
                </p>
              )}
            </div>

            {/* Número */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Número da Questão *
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base">{question.numero}</p>
                </div>
              ) : (
                <Input
                  type="number"
                  {...register("numero")}
                  className={errors.numero ? "border-red-500" : ""}
                />
              )}
              {errors.numero && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.numero.message}
                </p>
              )}
            </div>

            {/* Área ENEM */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Área do Conhecimento ENEM *
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base">
                    {question.enemArea || "Não definida"}
                  </p>
                </div>
              ) : (
                <Controller
                  name="enemArea"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Resetar campos dependentes quando área muda
                        form.setValue("materia", "");
                        form.setValue("frente1", "");
                      }}
                      disabled={!provaId || enemAreasDisponiveis.length === 0}
                    >
                      <SelectTrigger
                        className={errors.enemArea ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            !provaId
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
                  )}
                />
              )}
              {errors.enemArea && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.enemArea.message}
                </p>
              )}
              {isEditing && !provaId && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Selecione uma prova primeiro
                </p>
              )}
            </div>

            {/* Disciplina */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Disciplina *
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base">{materiaOriginal?.nome}</p>
                </div>
              ) : (
                <Controller
                  name="materia"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Resetar campos dependentes quando matéria muda
                        form.setValue("frente1", "");
                      }}
                      disabled={!enemArea || materiasDisponiveis.length === 0}
                    >
                      <SelectTrigger
                        className={errors.materia ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            !enemArea
                              ? "Selecione uma área primeiro"
                              : materiasDisponiveis.length === 0
                              ? "Nenhuma matéria disponível"
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
                  )}
                />
              )}
              {errors.materia && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.materia.message}
                </p>
              )}
              {isEditing && !enemArea && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Selecione uma área ENEM primeiro
                </p>
              )}
            </div>

            {/* Frente Principal */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Frente Principal *
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-base">
                    {materiaOriginal?.frentes?.find(
                      (frente) => frente._id === question.frente1
                    )?.nome || "Não definida"}
                  </p>
                </div>
              ) : (
                <Controller
                  name="frente1"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!materiaId || frentesDisponiveis.length === 0}
                    >
                      <SelectTrigger
                        className={errors.frente1 ? "border-red-500" : ""}
                      >
                        <SelectValue
                          placeholder={
                            !materiaId
                              ? "Selecione uma disciplina primeiro"
                              : frentesDisponiveis.length === 0
                              ? "Nenhuma frente disponível"
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
                  )}
                />
              )}
              {errors.frente1 && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.frente1.message}
                </p>
              )}
              {isEditing && !materiaId && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Selecione uma disciplina primeiro
                </p>
              )}
            </div>

            {/* Frente Secundária */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Frente Secundária
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p
                    className={`text-base ${
                      question.frente2 ? "" : "text-gray-400"
                    }`}
                  >
                    {infos?.frentes?.find(
                      (frente) => frente._id === question.frente2
                    )?.nome || "Não definida"}
                  </p>
                </div>
              ) : (
                <Controller
                  name="frente2"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {infos?.frentes?.map((frente) => (
                          <SelectItem key={frente._id} value={frente._id}>
                            {frente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>

            {/* Frente Terciária */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Frente Terciária
              </label>
              {!isEditing ? (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p
                    className={`text-base ${
                      question.frente3 ? "" : "text-gray-400"
                    }`}
                  >
                    {infos?.frentes?.find(
                      (frente) => frente._id === question.frente3
                    )?.nome || "Não definida"}
                  </p>
                </div>
              ) : (
                <Controller
                  name="frente3"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {infos?.frentes?.map((frente) => (
                          <SelectItem key={frente._id} value={frente._id}>
                            {frente.nome || "Não definida"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>

            {/* Link da Prova */}
            {question.prova && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">
                  Link da Prova
                </label>
                <a
                  href={question.prova}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600 font-medium">
                    🔗 Visualizar Prova
                  </span>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revisões Necessárias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚠️ Revisões Necessárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Classificação de Prova */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Controller
                name="provaClassification"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
              <span className="text-sm">Classificação de Prova</span>
            </div>

            {/* Classificação de Disciplina e Frente */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Controller
                name="subjectClassification"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
              <span className="text-sm">
                Classificação de Disciplina e Frente
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <Controller
                name="reported"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                )}
              />
              <span className="text-sm">Report</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Ações (aparece apenas no modo edição) */}
      {isEditing && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {isDirty && (
                  <p className="text-sm text-amber-600 font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Você tem alterações não salvas
                  </p>
                )}
                {!isValid && isDirty && (
                  <p className="text-sm text-red-600 mt-1">
                    Por favor, corrija os erros antes de salvar
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty || !isValid}
                  variant="default"
                  size="sm"
                  className="bg-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Classificação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
