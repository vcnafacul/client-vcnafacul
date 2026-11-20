import PhotoEditor from "@/components/atoms/photoEditor";
import { StudentCard } from "@/components/molecules/studentCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { uploadProfileImage } from "@/services/prepCourse/student/uploadProfileImage";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import heic2any from "heic2any";
import { useEffect, useState } from "react";

interface InfoStudentEnrolledModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity: StudentsDtoOutput;
  updateEntity: (entity: StudentsDtoOutput) => void;
  partnerLogo: string | null;
}

export function InfoStudentEnrolledModal({
  isOpen,
  handleClose,
  entity,
  updateEntity,
  partnerLogo,
}: InfoStudentEnrolledModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const {
    data: { token, permissao },
  } = useAuthStore();
  // A foto exige Visualizar Estudantes (ou Gerenciar Processo Seletivo). Sem
  // ela, a api dá 403 e a tela mostrava a foto padrão (card 07).
  const podeVerFoto =
    !!permissao[Roles.visualizarEstudantes] ||
    !!permissao[Roles.gerenciarProcessoSeletivo];

  const executeAsync = useToastAsync();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const blob = await getProfilePhoto(entity.photo, token);
        const fileType = blob.type; // Tipo MIME do arquivo

        if (fileType === "image/heic" || fileType === "image/heif") {
          // Se for HEIC, converte para JPEG
          const convertedBlob = await heic2any({ blob, toType: "image/jpeg" });
          const convertedUrl = URL.createObjectURL(convertedBlob as Blob);
          setImageSrc(convertedUrl);
        } else {
          // Se não for HEIC, usa a imagem normal
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
        }
      } catch (error) {
        console.error("Erro ao carregar a imagem:", error);
      }
    };

    if (entity.photo && podeVerFoto) {
      fetchImage();
    }

    // Cleanup para evitar vazamento de memória
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [entity.photo, token, podeVerFoto]);

  const handleUploadProfileImage = async (file: File) => {
    await executeAsync({
      action: () => uploadProfileImage(file, entity.id, token),
      loadingMessage: "Atualizando foto...",
      successMessage: "Foto atualizada com sucesso!",
      errorMessage: "Erro ao atualizar foto",
      onSuccess: (res) => {
        updateEntity({ ...entity, photo: res as string } as StudentsDtoOutput);
      },
      onFinally: () => {
        setPhotoEditorOpen(false);
      },
    });
  };

  const ModalPhotoEditor = () => {
    return photoEditorOpen && photo ? (
      <PhotoEditor
        isOpen={photoEditorOpen}
        photo={photo}
        onConfirm={handleUploadProfileImage}
        handleClose={() => {
          setPhotoEditorOpen(false);
        }}
      />
    ) : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Carteirinha do estudante</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <StudentCard
            larguraClassName="w-full sm:w-[min(733px,100%)]"
            entity={entity}
            imageSrc={imageSrc}
            partnerLogo={partnerLogo}
            avisoDaFoto={
              podeVerFoto
                ? undefined
                : "Foto disponível só para quem visualiza estudantes"
            }
            onChangePhoto={(file: File) => {
              setPhoto(file);
              setPhotoEditorOpen(true);
            }}
          />
        </div>
        {ModalPhotoEditor()}
      </DialogContent>
    </Dialog>
  );
}
