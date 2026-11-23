import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GrupoDeCheckbox } from "../grupoDeCheckbox";
import { OptionsSelect } from "@/components/ui/options-select";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useModals } from "@/hooks/useModal";
import { ComplexCondition } from "@/types/partnerPrepForm/condition";
import { avaliarCondicao } from "../avaliarCondicao";
import { respostasIniciais } from "../respostasIniciais";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import { useCallback, useEffect, useState } from "react";
import ConfirmSubscription from "../modals/confirmSubscription";

interface PartnerPrepInscriptionStepFormProps {
  section: SectionForm;
  allAnswers: Record<string, unknown>;
  isLastSection: boolean;
  isFirstSection: boolean;
  onAdvance: (sectionAnswers: Record<string, unknown>) => void;
  onBack: () => void;
}

// Componente de Skeleton Loader
const FormSkeleton = ({ section }: { section: SectionForm }) => {
  const visibleQuestionsCount = section.questions.length;

  return (
    <div className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16 animate-pulse">
      {Array.from({ length: Math.max(visibleQuestionsCount, 4) }).map(
        (_, index) => {
          const skeletonType = index % 5;

          return (
            <div key={index} className="flex flex-col gap-2">
              {/* Label skeleton */}
              <div className="h-4 bg-muted rounded-sm w-3/4"></div>

              {/* Input skeleton baseado no tipo */}
              {skeletonType === 0 && (
                // Text input
                <div className="h-16 bg-muted rounded-sm"></div>
              )}
              {skeletonType === 1 && (
                // Select input
                <div className="h-16 bg-muted rounded-sm flex items-center px-3">
                  <div className="h-4 bg-muted rounded-sm w-1/2"></div>
                  <div className="ml-auto h-4 w-4 bg-muted rounded-sm"></div>
                </div>
              )}
              {skeletonType === 2 && (
                // Checkbox input
                <div className="flex gap-2 items-center">
                  <div className="h-4 w-4 bg-muted rounded-sm"></div>
                  <div className="h-4 bg-muted rounded-sm w-2/3"></div>
                </div>
              )}
              {skeletonType === 3 && (
                // Number input
                <div className="h-16 bg-muted rounded-sm"></div>
              )}
              {skeletonType === 4 && (
                // Multiple checkbox input
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="h-4 w-4 bg-muted rounded-sm"></div>
                    <div className="h-4 bg-muted rounded-sm w-1/2"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-4 w-4 bg-muted rounded-sm"></div>
                    <div className="h-4 bg-muted rounded-sm w-1/3"></div>
                  </div>
                </div>
              )}
            </div>
          );
        }
      )}

      {/* Botões skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <div className="h-12 bg-muted rounded-md flex-1"></div>
        <div className="h-12 bg-muted rounded-md flex-1"></div>
      </div>
    </div>
  );
};

const QuestionText = ({
  question,
  handleChange,
  error,
  value,
}: {
  question: QuestionForm;
  handleChange: (id: string, value: string) => void;
  error?: string;
  value?: string;
}) => {
  return (
    <Field label={question.text} required error={error}>
      <Input
        id={question._id}
        type="text"
        placeholder={question.helpText ?? "Sua resposta..."}
        value={value}
        onChange={(e) => handleChange(question._id, e.target.value)}
      />
    </Field>
  );
};

const QuestionBoolean = ({
  question,
  handleChange,
  error,
  value,
}: {
  question: QuestionForm;
  handleChange: (id: string, value: boolean) => void;
  error?: string;
  value?: boolean;
}) => {
  // Converter boolean para string para o select
  const selectValue =
    value === true ? "Sim" : value === false ? "Não" : undefined;

  return (
    <Field label={question.text} required error={error}>
      <OptionsSelect
        id={question._id}
        options={[
          { label: "Sim", value: "Sim" },
          { label: "Não", value: "Não" },
        ]}
        placeholder="Selecione"
        value={selectValue}
        onValueChange={(valor) => handleChange(question._id, valor === "Sim")}
      />
    </Field>
  );
};

const QuestionOptions = ({
  question,
  handleChange,
  error,
  value,
}: {
  question: QuestionForm;
  handleChange: (id: string, value: string) => void;
  error?: string;
  value?: string;
}) => {
  return (
    <Field label={question.text} required error={error}>
      <OptionsSelect
        id={question._id}
        options={(question.options ?? []).map((option) => ({
          label: option,
          value: option,
        }))}
        value={value}
        onValueChange={(valor) => handleChange(question._id, valor)}
      />
    </Field>
  );
};

const QuestionOptionsMultiple = ({
  question,
  handleChange,
  error,
}: {
  question: QuestionForm;
  handleChange: (id: string, value: string[]) => void;
  error?: string;
}) => {
  return (
    <GrupoDeCheckbox
      legenda={question.text}
      required
      error={error}
      opcoes={question.options || []}
      excludentes
      onValueChange={(valores) => handleChange(question._id, valores)}
    />
  );
};

const QuestionNumber = ({
  question,
  handleChange,
  error,
  value,
}: {
  question: QuestionForm;
  handleChange: (id: string, value: number) => void;
  error?: string;
  value?: number;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNumberChange = (e: any) => {
    const inputValue = e.target.value;

    // Permitir campo vazio para que o usuário possa apagar
    if (inputValue === "") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleChange(question._id, "" as any);
      return;
    }

    // Converter para número e validar
    const numValue = Number(inputValue);

    // Aceitar apenas números inteiros e positivos (>= 0)
    if (!isNaN(numValue) && numValue >= 0 && Number.isInteger(numValue)) {
      handleChange(question._id, numValue);
    }
  };

  return (
    <Field label={question.text} required error={error}>
      <Input
        id={question._id}
        type="number"
        inputMode="numeric"
        placeholder={question.helpText ?? "Digite um número..."}
        min={0}
        step={1}
        value={value}
        onChange={handleNumberChange}
      />
    </Field>
  );
};

export function PartnerPrepInscriptionStepForm({
  section,
  allAnswers,
  isLastSection,
  isFirstSection,
  onAdvance,
  onBack,
}: PartnerPrepInscriptionStepFormProps) {
  // Local answers for THIS section, pre-populated from allAnswers
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const modals = useModals(["modalConfirmSubscription"]);

  // Merge allAnswers (previous sections) with local answers for condition evaluation
  const mergedAnswers = { ...allAnswers, ...answers };

  // Initialize answers for this section (restore from allAnswers)
  useEffect(() => {
    // Sem "Não" padrão no Sim/Não (card 29): só o que já foi respondido.
    setAnswers(respostasIniciais(section, allAnswers));
    setErrors({});

    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [section, allAnswers]);

  const handleChange = (id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  // Evaluate basic conditions using merged answers (cross-section support)
  // Avaliação compartilhada com o ms de formulários (card 19).
  const evaluateCondition = useCallback(
    (condition?: ComplexCondition): boolean =>
      avaliarCondicao(condition, mergedAnswers),
    [mergedAnswers]
  );

  // Validate only questions in THIS section
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    section.questions.forEach((question) => {
      if (evaluateCondition(question.conditions)) {
        const answer = answers[question._id];

        if (answer === undefined || answer === null || answer === "") {
          newErrors[question._id] = "Este campo é obrigatório";
          hasErrors = true;
        }

        if (
          question.answerType === AnswerType.Options &&
          question.collection === AnswerCollectionType.Multiple
        ) {
          if (!Array.isArray(answer) || answer.length === 0) {
            newErrors[question._id] = "Selecione pelo menos uma opção";
            hasErrors = true;
          }
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Clean answers: only include visible questions from this section
  const cleanAnswers = (
    currentAnswers: Record<string, unknown>
  ): Record<string, unknown> => {
    const cleanedAnswers: Record<string, unknown> = {};

    section.questions.forEach((question) => {
      if (evaluateCondition(question.conditions)) {
        if (currentAnswers[question._id] !== undefined) {
          cleanedAnswers[question._id] = currentAnswers[question._id];
        }
      }
    });

    return cleanedAnswers;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const cleanedAnswers = cleanAnswers(answers);

    if (isLastSection) {
      setIsSubmitting(true);
      setTimeout(() => {
        modals.modalConfirmSubscription.open();
        setIsSubmitting(false);
      }, 300);
    } else {
      onAdvance(cleanedAnswers);
    }
  };

  const ModalConfirmSubscription = () => {
    return !modals.modalConfirmSubscription.isOpen ? null : (
      <ConfirmSubscription
        isOpen={modals.modalConfirmSubscription.isOpen}
        handleClose={() => {
          modals.modalConfirmSubscription.close();
        }}
        handleConfirm={() => {
          modals.modalConfirmSubscription.close();
          const cleanedAnswers = cleanAnswers(answers);
          onAdvance(cleanedAnswers);
        }}
      />
    );
  };

  if (isInitializing) {
    return <FormSkeleton section={section} />;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16 animate-in fade-in duration-300"
      >
        <h2 className="text-h1 text-foreground mb-6 text-start px-4">
          {section.name}
        </h2>
        {section.description && (
          <p className="text-muted-foreground/90 mb-2">{section.description}</p>
        )}
        {section.questions.length > 0 && <FormLegend />}
        {section.questions.map((question) => (
          <div key={question._id}>
            {evaluateCondition(question.conditions) && (
              <>
                {question.answerType === AnswerType.Text && (
                  <QuestionText
                    question={question}
                    handleChange={handleChange}
                    error={errors[question._id]}
                    value={answers[question._id] as string | undefined}
                  />
                )}
                {question.answerType === AnswerType.Boolean && (
                  <QuestionBoolean
                    question={question}
                    handleChange={handleChange}
                    error={errors[question._id]}
                    value={answers[question._id] as boolean | undefined}
                  />
                )}
                {question.answerType === AnswerType.Options &&
                  question.collection === AnswerCollectionType.Single && (
                    <QuestionOptions
                      question={question}
                      handleChange={handleChange}
                      error={errors[question._id]}
                      value={answers[question._id] as string | undefined}
                    />
                  )}
                {question.answerType === AnswerType.Options &&
                  question.collection === AnswerCollectionType.Multiple && (
                    <QuestionOptionsMultiple
                      question={question}
                      handleChange={handleChange}
                      error={errors[question._id]}
                    />
                  )}
                {question.answerType === AnswerType.Number && (
                  <QuestionNumber
                    question={question}
                    handleChange={handleChange}
                    error={errors[question._id]}
                    value={answers[question._id] as number | undefined}
                  />
                )}
              </>
            )}
          </div>
        ))}
        {Object.keys(errors).length > 0 && (
          <p className="text-body text-destructive font-semibold text-end">
            Por favor, preencha todos os campos obrigatórios
          </p>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {isFirstSection ? (
            <AlertDialog>
              <AlertDialogTrigger className="w-full">
                <div className="bg-cta w-full h-12 flex justify-center items-center text-cta-foreground font-bold rounded-md hover:bg-cta/90 transition-colors duration-200 cursor-pointer">
                  Voltar
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja voltar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se você deixar o formulário, perderá todas as informações já preenchidas
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={onBack}
                  >
                    Sair do formulário
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="w-full h-12 bg-cta text-cta-foreground font-bold rounded-md hover:bg-cta/90 transition-colors duration-200 cursor-pointer"
            >
              Voltar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-success text-success-foreground font-bold rounded-md hover:bg-success/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="button" decorative />
                <span>Processando...</span>
              </div>
            ) : isLastSection ? (
              "Confirmar"
            ) : (
              "Próximo"
            )}
          </button>
        </div>
      </form>
      {ModalConfirmSubscription()}
    </>
  );
}
