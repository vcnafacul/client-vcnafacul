import { getProfilePhoto } from "@/services/prepCourse/student/getProfilePhoto";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

const ProfileImage = ({ photo }: { photo: string }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const blob = await getProfilePhoto(photo, token);
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
        console.log(url);
      } catch (error) {
        console.error("Erro ao carregar a imagem:", error);
      }
    };

    if (photo) {
      fetchImage();
    }

    // Cleanup para evitar vazamento de memória
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  return (
    <div className="w-52 h-72 rounded-lg overflow-hidden">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Foto de perfil"
          className="w-full h-full object-cover"
        />
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default ProfileImage;
