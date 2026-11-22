import { rotuloDaLogica } from "../textosDeCondicao";
import { opcoesLimpas, opcoesRepetidas } from "../opcoes";
import { motivoDoErro } from "../motivoDoErro";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModals } from "@/hooks/useModal";
import {
  createQuestion,
  CreateQuestionDtoInput,
} from "@/services/partnerPrepForm/createQuestion";
import { useAuthStore } from "@/store/auth";
import { ComplexCondition } from "@/types/partnerPrepForm/condition";
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
import { OptionsSelect } from "@/components/ui/options-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useId, useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ModalConditions } from "./modalConditions";

interface ModalCreateQuestionProps extends ModalProps {
  isOpen: boolean;
  sectionId: string;
  availableQuestions?: QuestionForm[];
  onSuccess: (question: QuestionForm) => void;
  createFn?: (data: CreateQuestionDtoInput, token: string) => Promise<QuestionForm>;
}

interface FormData {
  text: string;
  helpText: string;
  answerType: AnswerType;
  collection: AnswerCollectionType;
  conditions?: ComplexCondition;
  options: string[];
  active: boolean;
}

const initialFormData: FormData = {
  text: "",
  helpText: "",
  answerType: AnswerType.Text,
  collection: AnswerCollectionType.Single,
  conditions: undefined,
  options: [""],
  active: true,
};

export function ModalCreateQuestion({
  isOpen,
  handleClose,
  sectionId,
  availableQuestions = [],
  onSuccess,
  createFn = createQuestion,
}: ModalCreateQuestionProps) {
  const {
    data: { token },
  } = useAuthStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const idOpcoes = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modals = useModals(["modalConditions"]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | AnswerCollectionType
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAnswerTypeChange = (newAnswerType: AnswerType) => {
    setFormData((prev) => ({
      ...prev,
      answerType: newAnswerType,
      // Reset collection e options quando mudar o tipo
      collection: AnswerCollectionType.Single,
      options: newAnswerType === AnswerType.Options ? [""] : [],
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.text.trim()) {
      newErrors.text = "O texto da pergunta é obrigatório";
    }

    if (formData.answerType === AnswerType.Options) {
      const validOptions = opcoesLimpas(formData.options);
      const repetidas = opcoesRepetidas(formData.options);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const validOptions =
        formData.answerType === AnswerType.Options
          ? opcoesLimpas(formData.options)
          : undefined;

      const questionData = {
        sectionId,
        text: formData.text.trim(),
        helpText: formData.helpText.trim() || undefined,
        answerType: formData.answerType,
        collection: formData.collection,
        options: validOptions,
        conditions: formData.conditions,
        active: formData.active,
      };

      const newQuestion = await createFn(questionData, token);
      toast.success("Questão criada com sucesso!");
      onSuccess(newQuestion);
      handleClose?.();
      resetForm();
    } catch (error: unknown) {
      toast.error(motivoDoErro(error, "Erro ao criar questão"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleCloseModal = () => {
    resetForm();
    handleClose?.();
  };

  const ConditionsModal = () => {
    return !modals.modalConditions.isOpen ? null : (
      <ModalConditions
        isOpen={modals.modalConditions.isOpen}
        handleClose={() => modals.modalConditions.close()}
        conditions={formData.conditions}
        availableQuestions={availableQuestions}
        onSave={(conditions) => {
          setFormData((prev) => ({ ...prev, conditions }));
          modals.modalConditions.close();
        }}
      />
    );
  };

  const isOptionsType = formData.answerType === AnswerType.Options;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
      <DialogContent
        size="lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Criar Nova Questão</DialogTitle>
          <DialogDescription>
            Preencha os dados da questão para a seção
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="-mx-1 px-1 pt-2">
          <div className="flex flex-col gap-6">
            {/* Texto da Pergunta */}
            <Field label="Texto da Pergunta" required error={errors.text || undefined}>
              <Textarea
                value={formData.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                rows={3}
              />
            </Field>

            {/* Help Text */}
            <Field
              label="Texto de Ajuda (Opcional)"
              hint="Texto adicional que aparecerá para ajudar o usuário"
            >
              <Textarea
                value={formData.helpText}
                onChange={(e) => handleInputChange("helpText", e.target.value)}
                rows={2}
              />
            </Field>

            {/* Tipo de Resposta */}
            <Field label="Tipo de Resposta" required>
              <OptionsSelect
                value={formData.answerType}
                onValueChange={(v) => handleAnswerTypeChange(v as AnswerType)}
                options={[
                  { value: AnswerType.Text, label: "Texto" },
                  { value: AnswerType.Number, label: "Número" },
                  { value: AnswerType.Boolean, label: "Sim/Não" },
                  { value: AnswerType.Options, label: "Opções (Dropdown)" },
                ]}
              />
            </Field>

            {/* Collection Type - Só aparece para Options */}
            {isOptionsType && (
              <fieldset className="grid gap-1.5">
                <legend className="mb-1.5 text-label">
                  Tipo de Seleção
                  <span aria-hidden="true" className="ml-0.5 text-destructive">
                    *
                  </span>
                  <span className="sr-only"> (obrigatório)</span>
                </legend>
                <RadioGroup
                  value={formData.collection}
                  onValueChange={(v) =>
                    handleInputChange("collection", v as AnswerCollectionType)
                  }
                  className="sm:grid-flow-col sm:justify-start sm:gap-6"
                >
                  <RadioGroupItem
                    value={AnswerCollectionType.Single}
                    label="Resposta Única"
                  />
                  <RadioGroupItem
                    value={AnswerCollectionType.Multiple}
                    label="Múltiplas Respostas"
                  />
                </RadioGroup>
              </fieldset>
            )}

            {/* Opções - Só aparece para Options */}
            {isOptionsType && (
              <div role="group" aria-labelledby={idOpcoes} className="grid gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span id={idOpcoes} className="text-label">
                    Opções de Resposta
                    <span aria-hidden="true" className="ml-0.5 text-destructive">
                      *
                    </span>
                    <span className="sr-only"> (obrigatório)</span>
                  </span>
                  <Button onClick={addOption} size="sm" variant="outline">
                    <Plus aria-hidden="true" />
                    Adicionar Opção
                  </Button>
                </div>

                {errors.options && (
                  <Alert variant="destructive" title={errors.options} />
                )}

                <div className="flex flex-col gap-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <Field label={`Opção ${index + 1}`} className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                        />
                      </Field>
                      {formData.options.length > 1 && (
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
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-h4">Condições</h3>
                <Button
                  onClick={() => modals.modalConditions.open()}
                  variant="outline"
                  size="sm"
                >
                  <Settings aria-hidden="true" />
                  {formData.conditions ? "Editar Condições" : "Definir Condições"}
                </Button>
              </div>

              {formData.conditions && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {`${formData.conditions.conditions.length} condição(ões)`}
                  </Badge>
                  <Badge variant="default">
                    {rotuloDaLogica(formData.conditions.logic)}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Status Ativo */}
            <Switch
              checked={formData.active}
              onCheckedChange={(v) => handleInputChange("active", v)}
              label="Questão Ativa"
            />
          </div>
          {ConditionsModal()}
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={handleCloseModal}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="primary" loading={loading}>
            {loading ? "Criando..." : "Criar Questão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
