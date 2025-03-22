import PhotoEditor from "@/components/atoms/photoEditor";
import { StudentCard } from "@/components/molecules/studentCard";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { uploadProfileImage } from "@/services/prepCourse/student/uploadProfileImage";
import { useAuthStore } from "@/store/auth";
import { StudentsDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import heic2any from "heic2any";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface InfoStudentEnrolledModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity: StudentsDtoOutput;
}

export function InfoStudentEnrolledModal({
  isOpen,
  handleClose,
  entity,
}: InfoStudentEnrolledModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const {
    data: { token },
  } = useAuthStore();

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

    if (entity.photo) {
      fetchImage();
    }

    // Cleanup para evitar vazamento de memória
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [entity.photo, token]);

  const handleUploadProfileImage = async (file: File) => {
    const id = toast.loading("Atualizando foto...");
    uploadProfileImage(file, entity.id, token)
      .then(() => {
        toast.update(id, {
          render: `Foto atualizada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleClose();
      })
      .catch(() => {
        toast.update(id, {
          render: `Erro ao atualizar foto`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .finally(() => {
        setPhotoEditorOpen(false);
      });
  };

  const ModalPhotoEditor = () => {
    return photoEditorOpen ? (
      <PhotoEditor
        isOpen={photoEditorOpen}
        photo={photo ? URL.createObjectURL(photo) : ""}
        onConfirm={handleUploadProfileImage}
        handleClose={() => {
          setPhotoEditorOpen(false);
        }}
      />
    ) : null;
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white rounded-md p-1"
    >
      <div className="p-6 pt-1">
        <StudentCard
          entity={entity}
          imageSrc={imageSrc}
          onChangePhoto={(file: File) => {
            setPhoto(file);
            setPhotoEditorOpen(true);
          }}
        />
      </div>
      <ModalPhotoEditor />
    </ModalTemplate>
  );
}
