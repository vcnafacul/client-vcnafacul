import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { InputFactory } from "@/components/organisms/inputFactory";
import { Checkbox } from "@/components/ui/checkbox";
import { useModals } from "@/hooks/useModal";
import {
  BaseCondition,
  ComplexCondition,
  Logic,
  Operator,
} from "@/types/partnerPrepForm/condition";
import PartnerPrepForm from "@/types/partnerPrepForm/partnerPrepForm";
import {
  AnswerCollectionType,
  AnswerType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useCallback, useEffect, useState } from "react";
import { EachStepProps } from "..";
import { SocioeconomicAnswer } from "../data";
import ConfirmSubscription from "../modals/confirmSubscription";

interface PartnerPrepInscriptionStepFormProps extends EachStepProps {
  partnerPrepForm: PartnerPrepForm;
}

// Componente de Skeleton Loader
const FormSkeleton = ({
  partnerPrepForm,
}: {
  partnerPrepForm: PartnerPrepForm;
}) => {
  // Contar quantas questões serão exibidas
  const visibleQuestionsCount = partnerPrepForm.sections.reduce(
    (count, section) => {
      return count + section.questions.length;
    },
    0
  );

  return (
    <div className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16 animate-pulse">
      {Array.from({ length: Math.max(visibleQuestionsCount, 4) }).map(
        (_, index) => {
          const skeletonType = index % 5;

          return (
            <div key={index} className="flex flex-col gap-2">
              {/* Label skeleton */}
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>

              {/* Input skeleton baseado no tipo */}
              {skeletonType === 0 && (
                // Text input
                <div className="h-16 bg-gray-200 rounded"></div>
              )}
              {skeletonType === 1 && (
                // Select input
                <div className="h-16 bg-gray-200 rounded flex items-center px-3">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="ml-auto h-4 w-4 bg-gray-300 rounded"></div>
                </div>
              )}
              {skeletonType === 2 && (
                // Checkbox input
                <div className="flex gap-2 items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              )}
              {skeletonType === 3 && (
                // Number input
                <div className="h-16 bg-gray-200 rounded"></div>
              )}
              {skeletonType === 4 && (
                // Multiple checkbox input
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              )}
            </div>
          );
        }
      )}

      {/* Botões skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <div className="h-12 bg-gray-200 rounded-md flex-1"></div>
        <div className="h-12 bg-gray-200 rounded-md flex-1"></div>
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
    <InputFactory
      id={question._id}
      label={question.text}
      placeholder={question.helpText ?? "Sua resposta..."}
      type="text"
      error={error ? { message: error } : undefined}
      value={value}
      className={question.text.length > 80 ? "h-20 pt-[40px]" : ""}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => handleChange(question._id, e.target.value)}
    />
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
  return (
    <div className="flex flex-col gap-2 m-2">
      <div className="flex gap-2">
        <Checkbox
          checked={value}
          onCheckedChange={(isCheck) => {
            handleChange(question._id, isCheck as boolean);
          }}
          className="h-4 w-4 flex justify-center items-center border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
        />
        <label className="text-sm text-grey">{question.text}</label>
      </div>
      {error && <span className="text-sm text-redError">{error}</span>}
    </div>
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
    <InputFactory
      id={question._id}
      label={question.text}
      type="select"
      options={question.options?.map((option) => ({
        label: option,
        value: option,
      }))}
      error={error ? { message: error } : undefined}
      value={value}
      className={question.text.length > 80 ? "h-20 pt-[48px]" : ""}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => handleChange(question._id, e.value)}
    />
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
    <InputFactory
      id={question._id}
      label={question.text}
      type="checkbox"
      checkboxs={question.options || []}
      propCleanRest="Não possuo"
      error={error ? { message: error } : undefined}
      onCheckedChange={(value: string[]) => {
        handleChange(question._id, value);
      }}
      isCheckbox
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
  return (
    <InputFactory
      id={question._id}
      label={question.text}
      placeholder={question.helpText ?? "Digite um número..."}
      type="number"
      error={error ? { message: error } : undefined}
      value={value}
      className={question.text.length > 100 ? "h-20 pt-[40px]" : ""}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(e: any) => handleChange(question._id, e.target.value)}
    />
  );
};

export function PartnerPrepInscriptionStepForm({
  partnerPrepForm,
  updateSocioeconomic,
  handleBack,
}: PartnerPrepInscriptionStepFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const modals = useModals(["modalConfirmSubscription"]);

  // Inicializar respostas booleanas como false
  useEffect(() => {
    const initialAnswers: Record<string, unknown> = {};

    partnerPrepForm.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.answerType === AnswerType.Boolean) {
          initialAnswers[question._id] = false;
        }
      });
    });

    setAnswers(initialAnswers);

    // Simular um pequeno delay para suavizar a transição
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [partnerPrepForm]);

  const handleChange = (id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    // Limpar erro quando o usuário começar a preencher
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  // Função para avaliar condições básicas
  const evaluateBasicCondition = useCallback(
    (rule: BaseCondition): boolean => {
      const value = answers[rule.questionId];
      switch (rule.operator) {
        case Operator.Equal:
          return value?.toString() === rule.expectedValue.toString();
        case Operator.Contains:
          return (
            typeof value === "string" &&
            value.includes(rule.expectedValue as string)
          );
        case Operator.GreaterThan:
          return Number(value) > Number(rule.expectedValue);
        case Operator.LessThan:
          return Number(value) < Number(rule.expectedValue);
        case Operator.GreaterThanOrEqual:
          return Number(value) >= Number(rule.expectedValue);
        case Operator.LessThanOrEqual:
          return Number(value) <= Number(rule.expectedValue);
        case Operator.NotEqual:
          return value !== rule.expectedValue;
        default:
          return false;
      }
    },
    [answers]
  );

  // Função para avaliar condições complexas
  const evaluateCondition = useCallback(
    (condition?: ComplexCondition): boolean => {
      if (!condition) return true;

      const results = condition.conditions.map(evaluateBasicCondition);
      if (condition.logic === Logic.And) {
        return results.every(Boolean);
      } else {
        return results.some(Boolean);
      }
    },
    [evaluateBasicCondition]
  );

  // Função para validar se todas as questões visíveis foram respondidas
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    partnerPrepForm.sections.forEach((section) => {
      section.questions.forEach((question) => {
        // Verificar se a questão deve ser exibida
        if (evaluateCondition(question.conditions)) {
          const answer = answers[question._id];

          // Verificar se a resposta está vazia ou undefined
          if (answer === undefined || answer === null || answer === "") {
            newErrors[question._id] = "Este campo é obrigatório";
            hasErrors = true;
          }

          // Validações específicas por tipo
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
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Função para limpar respostas de questões não obrigatórias
  const cleanAnswers = (
    currentAnswers: Record<string, unknown>
  ): Record<string, unknown> => {
    const cleanedAnswers: Record<string, unknown> = {};

    partnerPrepForm.sections.forEach((section) => {
      section.questions.forEach((question) => {
        // Se a questão deve ser exibida (condição verdadeira), manter a resposta
        if (evaluateCondition(question.conditions)) {
          if (currentAnswers[question._id] !== undefined) {
            cleanedAnswers[question._id] = currentAnswers[question._id];
          }
        }
        // Se a questão não deve ser exibida, não incluir no objeto limpo
      });
    });

    return cleanedAnswers;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Limpar respostas de questões não obrigatórias
    const cleanedAnswers = cleanAnswers(answers);

    console.log("Respostas originais:", answers);
    console.log("Respostas limpas:", cleanedAnswers);

    // Simular um pequeno delay para melhorar a UX
    setTimeout(() => {
      modals.modalConfirmSubscription.open();
      setIsSubmitting(false);
    }, 300);
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

          // Usar as respostas limpas (sem questões não obrigatórias)
          const cleanedAnswers = cleanAnswers(answers);

          // Converter answers limpas para o formato esperado
          const socioeconomicAnswers: SocioeconomicAnswer[] = [];
          partnerPrepForm.sections.forEach((section) => {
            section.questions.forEach((question) => {
              if (
                evaluateCondition(question.conditions) &&
                cleanedAnswers[question._id] !== undefined
              ) {
                socioeconomicAnswers.push({
                  questionId: question._id,
                  question: question.text,
                  answer: cleanedAnswers[question._id] as
                    | string
                    | string[]
                    | boolean
                    | number,
                });
              }
            });
          });

          updateSocioeconomic!(socioeconomicAnswers);
        }}
      />
    );
  };

  // Mostrar skeleton durante inicialização
  if (isInitializing) {
    return <FormSkeleton partnerPrepForm={partnerPrepForm} />;
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16 animate-in fade-in duration-300"
      >
        {partnerPrepForm.sections.map((section) => (
          <div key={section._id}>
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
          </div>
        ))}
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-redError font-semibold text-end">
            Por favor, preencha todos os campos obrigatórios
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <AlertDialogUI
            title="Tem certeza que deseja voltar?"
            description="Se você deixar o formulário, perderá todas as informações já preenchidas"
            onConfirm={handleBack!}
          >
            <AlertDialogTrigger className="w-full">
              <div className="bg-orange w-full h-12 flex justify-center items-center text-white font-bold rounded-md hover:bg-orange/90 transition-colors duration-200 cursor-pointer">
                Voltar
              </div>
            </AlertDialogTrigger>
          </AlertDialogUI>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-green2 text-white font-bold rounded-md hover:bg-green2/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processando...</span>
              </div>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </form>
      <ModalConfirmSubscription />
    </>
  );
}
