import { rotuloDaLogica } from "../textosDeCondicao";
import { opcoesLimpas, opcoesRepetidas } from "../opcoes";
import { motivoDoErro } from "../motivoDoErro";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastAsync } from "@/hooks/useToastAsync";
import { setQuestionActive } from "@/services/partnerPrepForm/setQuestionActive";
import { updateQuestionForm } from "@/services/partnerPrepForm/updateQuestion";
import { useAuthStore } from "@/store/auth";
import { dadosEditaveis, EditableFormData } from "./dadosEditaveis";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useId, useState } from "react";
import { Edit3, Plus, Save, Settings, Trash2, X } from "lucide-react";
import { ModalConditions } from "./modalConditions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModalShowQuestionProps extends ModalProps {
  isOpen: boolean;
  question: QuestionForm;
  availableQuestions?: QuestionForm[];
  onToggleActive?: () => void;
  onEdit?: (question: QuestionForm) => void;
  toggleActiveFn?: (token: string, id: string) => Promise<void>;
  updateFn?: (token: string, id: string, question: QuestionForm) => Promise<void>;
  readOnly?: boolean;
}

export function ModalShowQuestion({
  isOpen,
  handleClose,
  question,
  availableQuestions = [],
  onToggleActive,
  onEdit,
  toggleActiveFn = setQuestionActive,
  updateFn = updateQuestionForm,
  readOnly = false,
}: ModalShowQuestionProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const idOpcoes = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpenConditions, setIsOpenConditions] = useState<boolean>(false);
  // Remover todas as condições (card 22): no salvar vai `conditions: null`.
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);
  const [condicoesRemovidas, setCondicoesRemovidas] = useState(false);
  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const [editableData, setEditableData] = useState<EditableFormData>(
    dadosEditaveis(question)
  );

  const handleInputChange = (
    field: keyof EditableFormData,
    value: string | boolean | AnswerCollectionType
  ) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);

    await executeAsync({
      action: () => toggleActiveFn(token, question._id),
      loadingMessage: "Alterando status da questão...",
      successMessage: `Questão ${
        !question.active ? "ativada" : "desativada"
      } com sucesso!`,
      errorMessage: (e: unknown) =>
        motivoDoErro(e, "Erro ao alterar status da questão"),
      onSuccess: () => {
        onToggleActive?.();
        handleClose?.();
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Com as condições: antes o Cancelar as tirava da tela (card 25).
    setEditableData(dadosEditaveis(question));
    setCondicoesRemovidas(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editableData.text.trim()) {
      newErrors.text = "O texto da pergunta é obrigatório";
    }

    if (question.answerType === AnswerType.Options) {
      const validOptions = opcoesLimpas(editableData.options);
      const repetidas = opcoesRepetidas(editableData.options);
      if (validOptions.length === 0) {
        newErrors.options = "Pelo menos uma opção é obrigatória";
      } else if (validOptions.length < 2) {
        newErrors.options = "Pelo menos duas opções são necessárias";
      } else if (repetidas.length > 0) {
        newErrors.options = `As opções não podem se repetir: ${repetidas.join(", ")}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    if (onEdit) {
      const updatedQuestion: QuestionForm = {
        ...question,
        text: editableData.text.trim(),
        // "" apaga o texto de ajuda; `undefined` sumia do JSON e o antigo
        // ficava (card 22).
        helpText: editableData.helpText.trim(),
        collection: editableData.collection,
        conditions: editableData.conditions,
        options:
          question.answerType === AnswerType.Options
            ? opcoesLimpas(editableData.options)
            : undefined,
        active: editableData.active,
      };

      // `null` remove as condições no ms; ausente = não mexe (card 22).
      const paraEnviar =
        condicoesRemovidas && !editableData.conditions
          ? ({ ...updatedQuestion, conditions: null } as unknown as QuestionForm)
          : updatedQuestion;

      await executeAsync({
        action: () => updateFn(token, question._id, paraEnviar),
        loadingMessage: "Atualizando questão...",
        successMessage: "Questão atualizada com sucesso!",
        errorMessage: (e: unknown) =>
          motivoDoErro(e, "Erro ao atualizar questão"),
        onSuccess: () => {
          setIsEditMode(false);
          onEdit?.(updatedQuestion);
        },
        onFinally: () => {
          setLoading(false);
        },
      });
    }
  };

  const addOption = () => {
    setEditableData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (editableData.options.length > 1) {
      setEditableData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const getAnswerTypeLabel = (type: AnswerType) => {
    switch (type) {
      case AnswerType.Text:
        return "Texto";
      case AnswerType.Number:
        return "Número";
      case AnswerType.Boolean:
        return "Sim/Não";
      case AnswerType.Options:
        return "Opções (Dropdown)";
      default:
        return type;
    }
  };

  const isOptionsType = question.answerType === AnswerType.Options;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && (handleClose || (() => {}))()}>
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Questão" : "Visualizar Questão"}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {getAnswerTypeLabel(question.answerType)}
            </Badge>
            <StatusBadge variant={question.active ? "success" : "neutral"} look="tint">
              {question.active ? "Ativo" : "Inativo"}
            </StatusBadge>
            {!isEditMode && !readOnly && (
              <Button
                onClick={handleEditMode}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <Edit3 aria-hidden="true" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-6">
            {/* Texto da Pergunta */}
            <Field label="Texto da Pergunta" error={errors.text || undefined}>
              <Textarea
                value={editableData.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                rows={3}
                disabled={!isEditMode}
              />
            </Field>

            {/* Help Text */}
            <Field label="Texto de Ajuda">
              <Textarea
                value={editableData.helpText}
                onChange={(e) => handleInputChange("helpText", e.target.value)}
                rows={2}
                placeholder="Texto adicional para ajudar o usuário"
                disabled={!isEditMode}
              />
            </Field>

            {/* Collection Type - Só aparece para Options */}
            {isOptionsType && (
              <fieldset className="grid gap-1.5">
                <legend className="mb-1.5 text-label">Tipo de Seleção</legend>
                <RadioGroup
                  value={editableData.collection}
                  onValueChange={(v) =>
                    handleInputChange("collection", v as AnswerCollectionType)
                  }
                  className="sm:grid-flow-col sm:justify-start sm:gap-6"
                >
                  <RadioGroupItem
                    value={AnswerCollectionType.Single}
                    label="Resposta Única"
                    disabled={!isEditMode}
                  />
                  <RadioGroupItem
                    value={AnswerCollectionType.Multiple}
                    label="Múltiplas Respostas"
                    disabled={!isEditMode}
                  />
                </RadioGroup>
              </fieldset>
            )}

            {/* Opções - Só aparece para Options */}
            {isOptionsType && (
              <div role="group" aria-labelledby={idOpcoes} className="grid gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span id={idOpcoes} className="text-label">Opções de Resposta</span>
                  {isEditMode && (
                    <Button onClick={addOption} size="sm" variant="outline">
                      <Plus aria-hidden="true" />
                      Adicionar Opção
                    </Button>
                  )}
                </div>

                {errors.options && (
                  <Alert variant="destructive" title={errors.options} />
                )}

                <div className="flex flex-col gap-4">
                  {editableData.options.map((option, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <Field label={`Opção ${index + 1}`} className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          disabled={!isEditMode}
                        />
                      </Field>
                      {isEditMode && editableData.options.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remover opção ${index + 1}`}
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Condições */}
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-h4">Condições</h3>
                {isEditMode && (
                  <div className="flex flex-wrap gap-2">
                    {editableData.conditions && (
                      <Button
                        onClick={() => setConfirmarRemocao(true)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 aria-hidden="true" />
                        Remover condições
                      </Button>
                    )}
                    <Button
                      onClick={() => setIsOpenConditions(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Settings aria-hidden="true" />
                      {editableData.conditions
                        ? "Editar Condições"
                        : "Definir Condições"}
                    </Button>
                  </div>
                )}
              </div>

              {editableData.conditions ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {`${editableData.conditions.conditions.length} condição(ões)`}
                  </Badge>
                  <Badge variant="default">
                    {rotuloDaLogica(editableData.conditions.logic)}
                  </Badge>
                </div>
              ) : (
                <p className="text-body text-muted-foreground">
                  Nenhuma condição definida
                </p>
              )}
            </div>

            <Separator />

            {/* Status Ativo */}
            <Switch
              checked={editableData.active}
              onCheckedChange={handleToggleActive}
              // Ativar/desativar salva na hora e fecha o modal: em modo de
              // edição, isso descartaria as alterações ainda não salvas.
              disabled={loading || readOnly || isEditMode}
              label="Questão Ativa"
            />
          </div>
          {/* Modal de Condições */}
          <ModalConditions
            isOpen={isOpenConditions}
            handleClose={() => setIsOpenConditions(false)}
            conditions={editableData.conditions}
            availableQuestions={availableQuestions}
            questaoId={question._id}
            onSave={(conditions) => {
              setEditableData((prev) => ({ ...prev, conditions }));
              setIsOpenConditions(false);
            }}
          />
          <AlertDialog
            open={confirmarRemocao}
            onOpenChange={(aberto) => {
              if (!aberto) {
                setConfirmarRemocao(false);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover as condições desta questão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ela passa a aparecer para todos. A remoção vale quando você salvar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    setEditableData((prev) => ({ ...prev, conditions: undefined }));
                    setCondicoesRemovidas(true);
                    setConfirmarRemocao(false);
                  }}
                >
                  Remover condições
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogBody>

        {isEditMode && (
          <DialogFooter>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              disabled={loading}
            >
              <X aria-hidden="true" />
              Cancelar
            </Button>
            <Button onClick={handleSave} variant="primary" loading={loading}>
              {!loading && <Save aria-hidden="true" />}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
