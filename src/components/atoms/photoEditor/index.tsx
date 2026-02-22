import ModalTemplate from "@/components/templates/modalTemplate";
import getCroppedImg from "@/utils/cropImage";
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

interface PhotoEditorProps {
  isOpen: boolean;
  handleClose: () => void;
  /** File da foto; a URL é criada e revogada internamente para evitar imagem quebrada (ex.: Strict Mode). */
  photo: File;
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Criar e revogar a URL dentro do editor evita revogação precoce no parent (ex.: React Strict Mode)
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPhotoUrl(null);
    };
  }, [photo]);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !photoUrl) return;
    const croppedImage = await getCroppedImg(photoUrl, croppedAreaPixels);
    onConfirm(croppedImage);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-black/80 rounded-lg sm:rounded-xl p-2 sm:p-4 max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl w-[95vw] sm:w-[min(720px,92vw)] max-w-none"
      closer={false}
    >
      {/* Área do crop: ocupa boa parte da tela no mobile e desktop */}
      <div
        className="relative w-full flex-1 flex min-h-0 rounded-t-lg sm:rounded-t-xl overflow-hidden bg-gray-900"
        style={{
          // Mobile: ~60vh; desktop: até ~75dvh, sempre pelo menos 320px para o Cropper renderizar
          minHeight: "clamp(320px, 60vh, 75dvh)",
          maxHeight: "calc(100dvh - 100px)",
        }}
      >
        {photoUrl && (
          <Cropper
            image={photoUrl}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      {/* Barra de ações: sempre visível, com safe area no mobile */}
      <div
        className="flex gap-3 justify-end items-center p-3 sm:p-4 bg-gray-900 rounded-b-lg sm:rounded-b-xl shrink-0"
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
