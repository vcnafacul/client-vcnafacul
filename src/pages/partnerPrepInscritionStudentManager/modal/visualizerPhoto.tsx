import ModalTemplate from "@/components/templates/modalTemplate";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

interface Props {
  handleClose: () => void;
  isOpen: boolean;
  fileKey: string;
}

export function VisualizerProfilePhotos({
  handleClose,
  isOpen,
  fileKey,
}: Props) {
  const {
    data: { token },
  } = useAuthStore();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileKey) {
      getProfilePhoto(fileKey, token)
        .then((blob) => {
          // Forçar o tipo MIME para imagens PNG (apenas temporário)

          const url = URL.createObjectURL(blob);
          setFileType(blob.type);
          setFileUrl(url);
        })
        .catch((error) => {
          console.error("Erro ao buscar o arquivo:", error);
          setFileUrl(null);
        });
    }

    // Cleanup: Revogar o URL ao fechar o modal
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [isOpen, fileKey, token]);

  const renderContent = () => {
    if (!fileUrl) {
      return <p>Carregando...</p>;
    }

    if (fileType?.includes("image")) {
      return (
        <img
          src={fileUrl}
          alt="Documento"
          className="w-auto min-h-[500px] overflow-y-auto scrollbar-hide"
        />
      );
    }

    return <p>Formato de arquivo não suportado.</p>;
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md w-fit mx-4"
    >
      {renderContent()}
    </ModalTemplate>
  );
}
