import ProfileDefault from "@/assets/images/profile_carteirinha.png";
import { Roles } from "@/enums/roles/roles";
import { useAuthStore } from "@/store/auth";
import { Camera } from "lucide-react";
import { useRef } from "react";

interface PhotoStudentCardProps {
  photo: string | null;
  onChangePhoto?: (file: File) => void; // Função para lidar com a nova foto
}

const PhotoStudentCard = ({ photo, onChangePhoto }: PhotoStudentCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data: { permissao },
  } = useAuthStore();

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Simula um clique no input de arquivo
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangePhoto && event.target.files && event.target.files.length > 0) {
      onChangePhoto(event.target.files[0]); // Passa o arquivo para a função recebida
    }
  };

  return (
    <div className="w-48 h-72 rounded-lg overflow-hidden relative">
      <img
        src={photo || ProfileDefault}
        alt="Foto de perfil"
        className="w-full h-full object-cover"
      />

      {onChangePhoto && (
        <>
          {/* Ícone de câmera sobre a imagem */}
          {permissao[Roles.gerenciarEstudantes] && (
            <button
              onClick={handleClick}
              className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
            >
              <Camera className="text-white w-6 h-6" />
            </button>
          )}

          {/* Input de arquivo invisível */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default PhotoStudentCard;
