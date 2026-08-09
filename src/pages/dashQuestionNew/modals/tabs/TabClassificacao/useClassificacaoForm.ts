import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { updateClassification } from "@/services/question/updateClassification";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClassificacaoFormData, classificacaoSchema } from "./schema";

interface UseClassificacaoFormProps {
  question: Question;
  onSaveSuccess?: () => void;
}

/**
 * Hook do formulário de classificação.
 * `provaSelIdx` seleciona qual vínculo (prova+numero) da questão está em foco:
 * navegável em view, congelado ao entrar em edição.
 */
export function useClassificacaoForm({
  question,
  onSaveSuccess,
}: UseClassificacaoFormProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const provasContendo = question.provasContendo ?? [];

  const [provaSelIdx, setProvaSelIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProva, setEditingProva] = useState<
    { provaId: string; numero: number } | undefined
  >();

  const provaSel = provasContendo[provaSelIdx];

  const buildValues = (ps?: { provaId: string; numero: number }) => ({
    prova: ps?.provaId ?? "",
    numero: ps?.numero ?? null,
    enemArea: question.enemArea || "",
    materia: question.materia || "",
    frente1: question.frente1 || "",
    frente2: question.frente2 || "",
    frente3: question.frente3 || "",
    provaClassification: question.provaClassification || false,
    subjectClassification: question.subjectClassification || false,
    reported: question.reported || false,
  });

  const form = useForm<ClassificacaoFormData>({
    resolver: yupResolver(classificacaoSchema),
    defaultValues: buildValues(provasContendo[0]),
    mode: "onChange",
  });

  const isDirty = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  // Ao trocar de questão: volta pro primeiro vínculo e sai da edição.
  useEffect(() => {
    setProvaSelIdx(0);
    form.reset(buildValues(question.provasContendo?.[0]));
    setIsEditing(false);
    // question._id é o sinal canônico de "trocou de questão". Valores dos campos
    // da mesma questão sempre chegam juntos num objeto novo (refreshQuestion), e
    // handleSave já reseta o baseline do form pós-save — logo não dependemos deles aqui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question._id]);

  const handleEdit = () => {
    setEditingProva(provaSel);
    form.reset(buildValues(provaSel));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    const formData = form.getValues();
    try {
      await executeAsync({
        action: () =>
          updateClassification(
            {
              _id: question._id,
              prova: formData.prova,
              numero: formData.numero,
              enemArea: formData.enemArea,
              materia: formData.materia,
              frente1: formData.frente1,
              frente2: formData.frente2 || undefined,
              frente3: formData.frente3 || undefined,
              provaClassification: formData.provaClassification,
              subjectClassification: formData.subjectClassification,
              reported: formData.reported,
            },
            token
          ),
        loadingMessage: "Salvando classificação...",
        successMessage: "✅ Classificação salva com sucesso!",
        errorMessage: "Erro ao salvar classificação",
        onFinally: () => setIsSaving(false),
      });
      form.reset(formData);
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error("Erro ao salvar classificação:", error);
    }
  };

  const handleCancel = () => {
    form.reset(buildValues(editingProva));
    setIsEditing(false);
  };

  return {
    form,
    control: form.control,
    provasContendo,
    provaSel,
    provaSelIdx,
    setProvaSelIdx,
    isEditing,
    isSaving,
    isDirty,
    isValid,
    errors,
    handleEdit,
    handleSave,
    handleCancel,
  };
}
