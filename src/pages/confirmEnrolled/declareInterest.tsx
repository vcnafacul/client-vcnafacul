import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { useToastAsync } from "@/hooks/useToastAsync";
import { confirmDeclaration } from "@/services/prepCourse/student/confirmDeclaration";
import { submitDocuments } from "@/services/prepCourse/student/submitDocuments";
import { submitPhoto } from "@/services/prepCourse/student/submitPhoto";
import { submitSurvey } from "@/services/prepCourse/student/submitSurvey";
import { useAuthStore } from "@/store/auth";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import SendDocuments from "./steps/sendDocuments";
import SendPhoto from "./steps/sendPhoto";
import SendQuest from "./steps/sendQuest";
import { Steps } from "./steps/steps";
import SuccessStep from "./steps/successStep";

interface Props {
  isFree: boolean;
  studentId: string;
  requestDocuments: boolean;
  documentsDone: boolean;
  photoDone: boolean;
  surveyDone: boolean;
}

function getInitialStep(
  requestDocuments: boolean,
  documentsDone: boolean,
  photoDone: boolean,
  surveyDone: boolean,
): Steps {
  if (requestDocuments && !documentsDone) return Steps.Documents;
  if (!photoDone) return Steps.Photo;
  if (!surveyDone) return Steps.Quest;
  return Steps.Quest;
}

export default function DeclareInterest({
  isFree,
  studentId,
  requestDocuments,
  documentsDone: initialDocsDone,
  photoDone: initialPhotoDone,
  surveyDone: initialSurveyDone,
}: Props) {
  const [documentsDone, setDocumentsDone] = useState(initialDocsDone);
  const [photoDone, setPhotoDone] = useState(initialPhotoDone);

  const [areaInterest, setAreaInterest] = useState<string[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [step, setStep] = useState<Steps>(
    getInitialStep(requestDocuments, initialDocsDone, initialPhotoDone, initialSurveyDone),
  );
  const [processing, setProcessing] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const getFriendlyErrorMessage = (e: unknown): string => {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      typeof msg === "string" &&
      (msg === "Failed to fetch" || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("load failed"))
    ) {
      return "Não foi possível enviar. Verifique sua conexão com a internet e tente novamente.";
    }
    return msg || "Erro ao enviar. Tente novamente.";
  };

  const requestConfirmation = useCallback((action: () => void) => {
    pendingAction.current = action;
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setConfirmOpen(false);
    pendingAction.current = null;
  }, []);

  const doSubmitDocuments = (files: File[]) => {
    if (!token?.trim()) {
      toast.error("Sessão expirada. Faça login novamente para continuar.");
      return;
    }
    setProcessing(true);
    executeAsync({
      action: () => submitDocuments(files, studentId, token),
      loadingMessage: "Enviando documentos...",
      successMessage: "Documentos enviados com sucesso!",
      errorMessage: (e) => getFriendlyErrorMessage(e),
      onSuccess: () => {
        setDocumentsDone(true);
        setStep(Steps.Photo);
      },
    }).finally(() => setProcessing(false));
  };

  const handleSubmitDocuments = (files: File[]) => {
    requestConfirmation(() => doSubmitDocuments(files));
  };

  const doSubmitPhoto = (photo: File) => {
    if (!token?.trim()) {
      toast.error("Sessão expirada. Faça login novamente para continuar.");
      return;
    }
    setProcessing(true);
    executeAsync({
      action: () => submitPhoto(photo, studentId, token),
      loadingMessage: "Enviando foto...",
      successMessage: "Foto enviada com sucesso!",
      errorMessage: (e) => getFriendlyErrorMessage(e),
      onSuccess: () => {
        setPhotoDone(true);
        setStep(Steps.Quest);
      },
    }).finally(() => setProcessing(false));
  };

  const handleSubmitPhoto = (photo: File) => {
    requestConfirmation(() => doSubmitPhoto(photo));
  };

  const doSubmitSurvey = (areas: string[], cursos: string[]) => {
    if (!token?.trim()) {
      toast.error("Sessão expirada. Faça login novamente para continuar.");
      return;
    }
    setProcessing(true);
    executeAsync({
      action: async () => {
        await submitSurvey(areas, cursos, studentId, token);
        await confirmDeclaration(studentId, token);
      },
      loadingMessage: "Finalizando declaração de interesse...",
      successMessage: "Declaração de interesse enviada com sucesso!",
      errorMessage: (e) => getFriendlyErrorMessage(e),
      onSuccess: () => {
        setStep(Steps.Sucess);
      },
    }).finally(() => setProcessing(false));
  };

  const handleSubmitSurvey = async (areas: string[], cursos: string[]) => {
    requestConfirmation(() => doSubmitSurvey(areas, cursos));
  };

  const StepsComponent = () => {
    switch (step) {
      case Steps.Documents:
        return (
          <SendDocuments
            isFree={isFree}
            onSubmit={handleSubmitDocuments}
            files={[]}
            processing={processing}
          />
        );
      case Steps.Photo:
        return (
          <SendPhoto
            onSubmit={handleSubmitPhoto}
            oldPhoto={null}
            requestDocuments={requestDocuments}
            documentsDone={documentsDone}
            processing={processing}
          />
        );
      case Steps.Quest:
        return (
          <SendQuest
            onSubmit={handleSubmitSurvey}
            back={(areas: string[], cursos: string[]) => {
              if (!photoDone) {
                setStep(Steps.Photo);
              }
              setAreaInterest(areas);
              setSelectedCursos(cursos);
            }}
            selectedField={areaInterest}
            selectedCourse={selectedCursos}
            processing={processing}
            photoDone={photoDone}
          />
        );
      default:
        return <SuccessStep />;
    }
  };

  const stepsCircle: StepCicle[] = [];

  if (requestDocuments) {
    stepsCircle.push({
      name: Steps.Documents,
      status:
        step === Steps.Documents
          ? "current"
          : documentsDone
            ? "complete"
            : "upcoming",
    });
  }

  stepsCircle.push({
    name: Steps.Photo,
    status:
      step === Steps.Photo
        ? "current"
        : photoDone
          ? "complete"
          : "upcoming",
  });
  stepsCircle.push({
    name: Steps.Quest,
    status:
      step === Steps.Quest
        ? "current"
        : step === Steps.Sucess
          ? "complete"
          : "upcoming",
  });

  return (
    <div className="flex flex-col items-center p-6 w-full gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Pré-Matrícula: Declaração de Interesse
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {step != Steps.Sucess &&
            (isFree ? (
              <>
                Parabéns pela isenção! 🎉 Não se esqueça de enviar as
                informações necessárias para concluir sua inscrição.
              </>
            ) : (
              <>
                Olá caro estudante, para declarar interesse na matrícula,
                precisamos de algumas informações a mais.
              </>
            ))}
        </p>
      </div>
      <StepperCircle steps={stepsCircle} />
      <StepsComponent />
      <ModalConfirmCancel
        isOpen={confirmOpen}
        handleClose={handleCancelConfirm}
        handleConfirm={handleConfirm}
        text="Atenção"
      >
        <p className="text-gray-600">
          Uma vez confirmado, não será possível voltar atrás nesta etapa.
          Deseja continuar?
        </p>
      </ModalConfirmCancel>
    </div>
  );
}
