import { Button } from "@/components/ui/button";
import { CreateQuestion } from "@/dtos/question/updateQuestion";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createQuestion } from "@/services/question/createQuestion";
import { uploadAsset } from "@/services/question/uploadAsset";
import { useAuthStore } from "@/store/auth";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ModalTabTemplateQuestion from "../components/ModalTabTemplateQuestion";
import { TabClassificacaoCreate } from "./tabs/TabClassificacaoCreate";
import { TabConteudoCreate } from "./tabs/TabConteudoCreate";
import { TabAlternativasCreate } from "./tabs/TabAlternativasCreate";
import { validarQuestaoNova } from "./validarQuestaoNova";
import { toast } from "react-toastify";

interface ModalCreateQuestionProps {
  isOpen: boolean;
  onClose: () => void;
  infos: any;
  onSuccess?: () => void;
}

const emptyForm: Partial<CreateQuestion> = {
  prova: "",
  enemArea: "",
  frente1: "",
  frente2: null,
  frente3: null,
  materia: "",
  // ⚠️ Vazio, e não `1` (card 03): com prova, ficava preenchido sem a pessoa
  // escolher; sem prova, ia no corpo e o ms recusa número sem prova.
  numero: null,
  textoQuestao: "",
  pergunta: "",
  textoAlternativaA: "",
  textoAlternativaB: "",
  textoAlternativaC: "",
  textoAlternativaD: "",
  textoAlternativaE: "",
  alternativa: "",
};

export function ModalCreateQuestion({
  isOpen,
  onClose,
  infos,
  onSuccess,
}: ModalCreateQuestionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateQuestion>>({
    ...emptyForm,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pendingStoreRef = useRef(new PendingImageStore());

  const handleImageUpload = useCallback(
    async (file: File) => {
      return pendingStoreRef.current.add(file);
    },
    []
  );

  const updateFormData = (field: keyof CreateQuestion, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const { erros, resumo } = validarQuestaoNova(formData);
    setErrors(erros);
    /*
      ⚠️ **Avisa, e não só marca os campos.** Cada erro aparece só na sua aba;
      sem o toast, clicar em "Criar Questão" em outra aba não fazia nada visível.
    */
    if (resumo) toast.error(resumo);
    return resumo === null;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Deferred upload: upload pending images before creating
    const pendingStore = pendingStoreRef.current;
    const saveData = { ...formData };
    if (pendingStore.hasPending()) {
      const textFields: (keyof CreateQuestion)[] = [
        'textoQuestao', 'pergunta', 'textoAlternativaA', 'textoAlternativaB',
        'textoAlternativaC', 'textoAlternativaD', 'textoAlternativaE',
      ];
      const allText = textFields.map(f => (saveData[f] as string) || "").join(" ");
      pendingStore.pruneUnused(allText);

      if (pendingStore.hasPending()) {
        const uploadFn = (file: File) => uploadAsset(file, token);
        const replacements = await pendingStore.uploadAll(uploadFn);
        for (const field of textFields) {
          const val = saveData[field];
          if (typeof val === "string" && val) {
            (saveData as any)[field] = PendingImageStore.replaceInMarkdown(val, replacements);
          }
        }
      }
      pendingStore.cleanup();
    }

    await executeAsync({
      action: () =>
        createQuestion(
          { ...saveData, contentFormat: "markdown" } as CreateQuestion,
          token
        ),
      loadingMessage: "Criando questão...",
      successMessage: "Questão criada com sucesso!",
      errorMessage: "Erro ao criar questão",
      onSuccess: () => {
        setFormData({ ...emptyForm });
        setErrors({});
        onClose();
        if (onSuccess) onSuccess();
      },
      onFinally: () => setIsSaving(false),
    });
  };

  const handleClose = () => {
    if (
      !isSaving &&
      Object.keys(formData).some((key) => {
        const value = formData[key as keyof CreateQuestion];
        return value && value !== "" && value !== 1;
      })
    ) {
      if (
        confirm(
          "Você tem alterações não salvas. Deseja realmente fechar o modal?"
        )
      ) {
        pendingStoreRef.current.cleanup();
        setFormData({ ...emptyForm });
        setErrors({});
        onClose();
      }
    } else {
      pendingStoreRef.current.cleanup();
      onClose();
    }
  };

  return (
    <ModalTabTemplateQuestion
      isOpen={isOpen}
      className="px-4 py-2"
      tabs={[
        {
          label: "Classificação",
          id: "classificacao",
          children: (
            <TabClassificacaoCreate
              formData={formData}
              errors={errors}
              infos={infos}
              onChange={updateFormData}
            />
          ),
          handleClose: handleClose,
        },
        {
          label: "Enunciado",
          id: "conteudo",
          children: (
            <TabConteudoCreate
              formData={formData}
              errors={errors}
              onChange={updateFormData}
              onImageUpload={handleImageUpload}
              pendingStore={pendingStoreRef.current}
              token={token}
            />
          ),
          handleClose: handleClose,
        },
        {
          label: "Alternativas",
          id: "alternativas",
          children: (
            <TabAlternativasCreate
              formData={formData}
              errors={errors}
              onChange={updateFormData}
              onImageUpload={handleImageUpload}
              pendingStore={pendingStoreRef.current}
              token={token}
            />
          ),
          handleClose: handleClose,
        },
      ]}
      footerContent={
        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar Questão
              </>
            )}
          </Button>
        </div>
      }
    />
  );
}
