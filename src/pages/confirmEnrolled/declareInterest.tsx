import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import { useToastAsync } from "@/hooks/useToastAsync";
import { declaredInterest } from "@/services/prepCourse/student/declaredInterest";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import SendDocuments from "./steps/sendDocuments";
import SendPhoto from "./steps/sendPhoto";
import SendQuest from "./steps/sendQuest";
import { Steps } from "./steps/steps";
import SuccessStep from "./steps/successStep";

interface Props {
  isFree: boolean;
  studentId: string;
  requestDocuments: boolean;
}

export default function DeclareInterest({
  isFree,
  studentId,
  requestDocuments,
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [areaInterest, setAreaInterest] = useState<string[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [step, setStep] = useState<Steps>(
    requestDocuments ? Steps.Documents : Steps.Photo,
  );
  const [processing, setProcessing] = useState<boolean>(false);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleSubmit = (areaInterest: string[], selectedCursos: string[]) => {
    setProcessing(true);
    executeAsync({
      action: () =>
        declaredInterest(
          uploadedFiles,
          uploadedPhoto as File,
          areaInterest,
          selectedCursos,
          studentId,
          token,
        ),
      loadingMessage: "Declarando interesse...",
      successMessage: "Declaração de interesse enviadas com sucesso!",
      errorMessage: (e) => e.message,
      onSuccess: () => setStep(Steps.Sucess),
    }).finally(() => {
      setProcessing(false);
    });
  };

  const StepsComponent = () => {
    switch (step) {
      case Steps.Documents:
        return (
          <SendDocuments
            isFree={isFree}
            onSubmit={(files: File[]) => {
              setUploadedFiles(files);
              setStep(Steps.Photo);
            }}
            files={uploadedFiles}
          />
        );
      case Steps.Photo:
        return (
          <SendPhoto
            onSubmit={(file: File) => {
              setUploadedPhoto(file);
              setStep(Steps.Quest);
            }}
            back={(file: File | null) => {
              setUploadedPhoto(file);
              setStep(Steps.Documents);
            }}
            oldPhoto={uploadedPhoto}
            requestDocuments={requestDocuments}
          />
        );
      case Steps.Quest:
        return (
          <SendQuest
            onSubmit={async (areas: string[], cursos: string[]) => {
              handleSubmit(areas, cursos);
            }}
            back={(areas: string[], cursos: string[]) => {
              setStep(Steps.Photo);
              setAreaInterest(areas);
              setSelectedCursos(cursos);
            }}
            selectedField={areaInterest}
            selectedCourse={selectedCursos}
            processing={processing}
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
      status: step == Steps.Documents ? "current" : "complete",
    });
  }

  stepsCircle.push({
    name: Steps.Photo,
    status:
      step === Steps.Documents
        ? "upcoming"
        : step === Steps.Photo
          ? "current"
          : "complete",
  });
  stepsCircle.push({
    name: Steps.Quest,
    status:
      step == Steps.Quest
        ? "current"
        : step === Steps.Sucess
          ? "complete"
          : "upcoming",
  });

  return (
    <div className="flex flex-col items-center p-6 w-full gap-8">
      {/* Mensagem inicial */}
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
    </div>
  );
}
