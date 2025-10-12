import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { setQuestionActive } from "@/services/partnerPrepForm/setQuestionActive";
import { updateQuestionForm } from "@/services/partnerPrepForm/updateQuestion";
import { useAuthStore } from "@/store/auth";
import { ComplexCondition } from "@/types/partnerPrepForm/condition";
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
import {
  FiEdit3,
  FiPlus,
  FiSave,
  FiSettings,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { ModalConditions } from "./modalConditions";

interface ModalShowQuestionProps extends ModalProps {
  isOpen: boolean;
  question: QuestionForm;
  availableQuestions?: QuestionForm[];
  onToggleActive?: () => void;
  onEdit?: (question: QuestionForm) => void;
}

interface EditableFormData {
  text: string;
  helpText: string;
  collection: AnswerCollectionType;
  conditions?: ComplexCondition;
  options: string[];
  active: boolean;
}

export function ModalShowQuestion({
  isOpen,
  handleClose,
  question,
  availableQuestions = [],
  onToggleActive,
  onEdit,
}: ModalShowQuestionProps) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpenConditions, setIsOpenConditions] = useState<boolean>(false);
  const {
    data: { token },
  } = useAuthStore();

  const [editableData, setEditableData] = useState<EditableFormData>({
    text: question.text,
    helpText: question.helpText || "",
    collection: question.collection,
    conditions: question.conditions || undefined,
    options: question.options || [],
    active: question.active,
  });

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

  const handleToggleActive = () => {
    setLoading(true);
    const id = toast.loading("Alterando status da questão...");
    setQuestionActive(token, question._id)
      .then(() => {
        toast.update(id, {
          render: `Questão ${
            !question.active ? "ativada" : "desativada"
          } com sucesso!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onToggleActive?.();
        handleClose?.();
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditableData({
      text: question.text,
      helpText: question.helpText || "",
      collection: question.collection,
      options: question.options || [],
      active: question.active,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editableData.text.trim()) {
      newErrors.text = "O texto da pergunta é obrigatório";
    }

    if (question.answerType === AnswerType.Options) {
      const validOptions = editableData.options.filter(
        (option) => option.trim() !== ""
      );
      if (validOptions.length === 0) {
        newErrors.options = "Pelo menos uma opção é obrigatória";
      } else if (validOptions.length < 2) {
        newErrors.options = "Pelo menos duas opções são necessárias";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const id = toast.loading("Atualizando questão...");
    if (onEdit) {
      const updatedQuestion: QuestionForm = {
        ...question,
        text: editableData.text.trim(),
        helpText: editableData.helpText.trim() || undefined,
        collection: editableData.collection,
        conditions: editableData.conditions,
        options:
          question.answerType === AnswerType.Options
            ? editableData.options.filter((option) => option.trim() !== "")
            : undefined,
        active: editableData.active,
      };

      updateQuestionForm(token, question._id, updatedQuestion)
        .then(() => {
          toast.update(id, {
            render: "Questão atualizada com sucesso!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });

          setIsEditMode(false);
          onEdit(updatedQuestion);
        })
        .catch((error) => {
          toast.update(id, {
            render: `Erro ao atualizar questão: ${error.message}`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoading(false);
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose || (() => {})}
      className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            {isEditMode ? "Editar Questão" : "Visualizar Questão"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {!isEditMode && (
              <Button
                startIcon={<FiEdit3 />}
                onClick={handleEditMode}
                variant="outlined"
                size="small"
              >
                Editar
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
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
        </Box>
      </Box>

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
                  startIcon={<FiPlus />}
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
                      <FiTrash2 />
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
              <Button
                startIcon={<FiSettings />}
                onClick={() => setIsOpenConditions(true)}
                variant="outlined"
                size="small"
              >
                {editableData.conditions
                  ? "Editar Condições"
                  : "Definir Condições"}
              </Button>
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
                label={editableData.conditions.logic}
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
              disabled={loading}
            />
          </Box>
        </Box>

        {/* Botões de Ação */}
        {isEditMode && (
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}
          >
            <Button
              onClick={handleCancelEdit}
              variant="outlined"
              disabled={loading}
              startIcon={<FiX />}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <FiSave />}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Modal de Condições */}
      <ModalConditions
        isOpen={isOpenConditions}
        handleClose={() => setIsOpenConditions(false)}
        conditions={editableData.conditions}
        availableQuestions={availableQuestions}
        onSave={(conditions) => {
          setEditableData((prev) => ({ ...prev, conditions }));
          setIsOpenConditions(false);
        }}
      />
    </ModalTemplate>
  );
}
