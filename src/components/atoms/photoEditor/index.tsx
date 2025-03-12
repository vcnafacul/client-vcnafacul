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
      className="bg-black rounded-md p-0.5"
      closer={false}
    >
      <div className="relative w-[90vw] h-[700px] sm:w-[600px] bg-gray-800">
        <Cropper
          image={photo}
          crop={crop}
          zoom={zoom}
          aspect={3/4} // Mantém a proporção quadrada
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={handleConfirm}
            className="bg-green-500 p-2 rounded-full hover:bg-green-700"
          >
            <Check className="text-white w-6 h-6" />
          </button>
          <button
            onClick={handleClose}
            className="bg-red-500 p-2 rounded-full hover:bg-red-700"
          >
            <X className="text-white w-6 h-6" />
          </button>
        </div>
      </div>
    </ModalTemplate>
  );
};
export default PhotoEditor;
