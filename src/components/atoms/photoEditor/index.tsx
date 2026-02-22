import ModalTemplate from "@/components/templates/modalTemplate";
import getCroppedImg from "@/utils/cropImage";
import { Check, X } from "lucide-react";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

interface PhotoEditorProps {
  isOpen: boolean;
  handleClose: () => void;
  photo: string;
  onConfirm: (file: File) => void;
}

const PhotoEditor = ({
  isOpen,
  photo,
  onConfirm,
  handleClose,
}: PhotoEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(photo, croppedAreaPixels);
    onConfirm(croppedImage); // Retorna a imagem processada para o `PhotoStudentCard`
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-black rounded-md p-0.5 max-h-[100dvh] flex flex-col overflow-hidden"
      closer={false}
    >
      {/* Área do crop: altura limitada no mobile para deixar os botões sempre visíveis */}
      <div className="relative w-[90vw] sm:w-[600px] flex-1 min-h-0 bg-gray-800 rounded-t-md">
        <Cropper
          image={photo}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      {/* Barra fixa de ações: sempre visível no mobile (abaixo da área de recorte) */}
      <div
        className="flex gap-3 justify-end p-3 bg-gray-800 rounded-b-md shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="bg-red-500 p-3 rounded-full hover:bg-red-700 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Cancelar"
        >
          <X className="text-white w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-green-500 p-3 rounded-full hover:bg-green-700 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Aprovar foto"
        >
          <Check className="text-white w-6 h-6" />
        </button>
      </div>
    </ModalTemplate>
  );
};
export default PhotoEditor;
