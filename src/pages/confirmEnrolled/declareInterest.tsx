/* eslint-disable @typescript-eslint/no-explicit-any */
import StepperCircle, { StepCicle } from "@/components/atoms/stepperCirCle";
import { declaredInterest } from "@/services/prepCourse/student/declaredInterest";
import { uploadDocs } from "@/services/prepCourse/student/uploadDocs";
import { uploadPhoto } from "@/services/prepCourse/student/uploadPhoto";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import SendDocuments from "./steps/sendDocuments";
import SendPhoto from "./steps/sendPhoto";
import SendQuest from "./steps/sendQuest";
import { Steps } from "./steps/steps";

interface Props {
  isFree: boolean;
  queryToken: string;
  studentId: string;
}

export default function DeclareInterest({
  isFree,
  queryToken,
  studentId,
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [areaInterest, setAreaInterest] = useState<string[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [step, setStep] = useState<Steps>(Steps.Documents);

  const {
    data: { token },
  } = useAuthStore();

  const handleDeclaredInterest = () => {
    const id = toast.loading(
      "Aguarde enquanto processando a declaração de interesse..."
    );
    declaredInterest(studentId, areaInterest, selectedCursos, token)
      .then(() => {
        toast.update(id, {
          render: "Declaração de interesse feita com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUploadDocs = () => {
    const id = toast.loading("Enviando documentos...");
    uploadDocs(uploadedFiles, queryToken)
      .then(() => {
        toast.update(id, {
          render: "Documentos enviados com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUploadPhoto = () => {
    const id = toast.loading("Enviando foto...");
    uploadPhoto(uploadedPhoto as File, queryToken)
      .then(() => {
        toast.update(id, {
          render: "Foto para carteirinha enviadas com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length > 0) {
      handleUploadDocs();
    }
    if (uploadedPhoto) {
      handleUploadPhoto();
    }
    handleDeclaredInterest();
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
            photo={uploadedPhoto}
          />
        );
      case Steps.Quest:
        return (
          <SendQuest
            onSubmit={(areas: string[], cursos: string[]) => {
              setAreaInterest(areas);
              setSelectedCursos(cursos);
              handleSubmit();
            }}
            back={(areas: string[], cursos: string[]) => {
              setStep(Steps.Photo);
              setAreaInterest(areas);
              setSelectedCursos(cursos);
            }}
            selectedField={areaInterest}
            selectedCourse={selectedCursos}
          />
        );
      default:
        return null;
    }
  };

  const stepsCircle: StepCicle[] = [
    {
      name: Steps.Documents,
      status: step == Steps.Documents ? "current" : "complete",
    },
    {
      name: Steps.Photo,
      status:
        step === Steps.Documents
          ? "upcoming"
          : step === Steps.Photo
          ? "current"
          : "complete",
    },
    {
      name: Steps.Quest,
      status: step == Steps.Quest ? "current" : "upcoming",
    },
  ];

  return (
    <div className="flex flex-col items-center p-6 w-full gap-8">
      {/* Mensagem inicial */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Declaração de interesse na matrícula
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {isFree ? (
            <>
              Parabéns pela isenção! 🎉 Não se esqueça de enviar as informações
              necessárias para concluir sua inscrição.
            </>
          ) : (
            <>
              Olá caro estudante, para declarar interesse na matrícula,
              precisamos de algumas informações a mais.
            </>
          )}
        </p>
      </div>
      <StepperCircle steps={stepsCircle} />
      <StepsComponent />
    </div>
  );
}
