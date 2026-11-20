import { rotuloDaLogica } from "../textosDeCondicao";
import { opcoesLimpas, opcoesRepetidas } from "../opcoes";
import { motivoDoErro } from "../motivoDoErro";
import { ModalProps } from "@/components/templates/modalTemplate";
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
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
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

  const getAnswerTypeColor = (type: AnswerType) => {
    switch (type) {
      case AnswerType.Text:
        return "primary";
      case AnswerType.Number:
        return "secondary";
      case AnswerType.Boolean:
        return "warning";
      case AnswerType.Options:
        return "info";
      default:
        return "default";
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              label={getAnswerTypeLabel(question.answerType)}
              color={getAnswerTypeColor(question.answerType)}
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
            <Chip
              label={question.active ? "Ativo" : "Inativo"}
              color={question.active ? "success" : "default"}
              variant={question.active ? "filled" : "outlined"}
            />
            {!isEditMode && !readOnly && (
              <Button
                startIcon={<Edit3 size="1em" />}
                onClick={handleEditMode}
                variant="outlined"
                size="small"
                sx={{ ml: "auto" }}
              >
                Editar
              </Button>
            )}
          </Box>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Texto da Pergunta */}
            <TextField
              label="Texto da Pergunta"
              value={editableData.text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              error={!!errors.text}
              helperText={errors.text}
              multiline
              rows={3}
              fullWidth
              disabled={!isEditMode}
              variant="outlined"
              sx={{
                "& .MuiInputBase-input.Mui-readOnly": {
                  backgroundColor: isEditMode ? "inherit" : "grey.50",
                },
              }}
            />

            {/* Help Text */}
            <TextField
              label="Texto de Ajuda"
              value={editableData.helpText}
              onChange={(e) => handleInputChange("helpText", e.target.value)}
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              placeholder="Texto adicional para ajudar o usuário"
              disabled={!isEditMode}
              sx={{
                "& .MuiInputBase-input.Mui-readOnly": {
                  backgroundColor: isEditMode ? "inherit" : "grey.50",
                },
              }}
            />

            {/* Collection Type - Só aparece para Options */}
            {isOptionsType && (
              <FormControl>
                <FormLabel component="legend">Tipo de Seleção</FormLabel>
                <RadioGroup
                  value={editableData.collection}
                  onChange={(e) =>
                    handleInputChange(
                      "collection",
                      e.target.value as AnswerCollectionType
                    )
                  }
                  row
                >
                  <FormControlLabel
                    value={AnswerCollectionType.Single}
                    control={<Radio />}
                    label="Resposta Única"
                    disabled={!isEditMode}
                  />
                  <FormControlLabel
                    value={AnswerCollectionType.Multiple}
                    control={<Radio />}
                    label="Múltiplas Respostas"
                    disabled={!isEditMode}
                  />
                </RadioGroup>
              </FormControl>
            )}

            {/* Opções - Só aparece para Options */}
            {isOptionsType && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <FormLabel component="legend">Opções de Resposta</FormLabel>
                  {isEditMode && (
                    <Button
                      startIcon={<Plus size="1em" />}
                      onClick={addOption}
                      size="small"
                      variant="outlined"
                    >
                      Adicionar Opção
                    </Button>
                  )}
                </Box>

                {errors.options && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.options}
                  </Alert>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {editableData.options.map((option, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", gap: 1, alignItems: "center" }}
                    >
                      <TextField
                        label={`Opção ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                        disabled={!isEditMode}
                        sx={{
                          "& .MuiInputBase-input.Mui-readOnly": {
                            backgroundColor: isEditMode ? "inherit" : "grey.50",
                          },
                        }}
                      />
                      {isEditMode && editableData.options.length > 1 && (
                        <IconButton
                          onClick={() => removeOption(index)}
                          color="error"
                          size="small"
                        >
                          <Trash2 size="1em" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Condições */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Condições</Typography>
                {isEditMode && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {editableData.conditions && (
                      <Button
                        startIcon={<Trash2 size="1em" />}
                        onClick={() => setConfirmarRemocao(true)}
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        Remover condições
                      </Button>
                    )}
                    <Button
                      startIcon={<Settings size="1em" />}
                      onClick={() => setIsOpenConditions(true)}
                      variant="outlined"
                      size="small"
                    >
                      {editableData.conditions
                        ? "Editar Condições"
                        : "Definir Condições"}
                    </Button>
                  </Box>
                )}
              </Box>

              {editableData.conditions ? (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                  <Chip
                    label={`${editableData.conditions.conditions.length} condição(ões)`}
                    color="info"
                    variant="outlined"
                  />
                  <Chip
                    label={rotuloDaLogica(editableData.conditions.logic)}
                    color="primary"
                    variant="filled"
                    size="small"
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Nenhuma condição definida
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Status Ativo */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                Questão Ativa
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Switch
                  checked={editableData.active}
                  onChange={handleToggleActive}
                  // Ativar/desativar salva na hora e fecha o modal: em modo de
                  // edição, isso descartaria as alterações ainda não salvas.
                  disabled={loading || readOnly || isEditMode}
                />
              </Box>
            </Box>
          </Box>
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
              variant="outlined"
              disabled={loading}
              startIcon={<X size="1em" />}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save size="1em" />}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
