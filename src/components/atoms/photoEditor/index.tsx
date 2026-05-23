import ModalTemplate from "@/components/templates/modalTemplate";
import getCroppedImg from "@/utils/cropImage";
import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

export interface AspectPreset {
  /** Label exibido no chip (ex.: "1:1", "16:9", "Original") */
  label: string;
  /**
   * Aspect ratio (largura/altura). Quando omitido, o editor usa a proporção
   * natural da imagem carregada (sem recorte forçado).
   */
  aspect?: number;
  /** Override do targetSize para este preset. Quando omitido, usa o targetSize do PhotoEditor (ou pixels do crop se ambos forem omitidos). */
  targetSize?: { width: number; height: number };
}

interface PhotoEditorProps {
  isOpen: boolean;
  handleClose: () => void;
  /** File da foto; a URL é criada e revogada internamente para evitar imagem quebrada (ex.: Strict Mode). */
  photo: File;
  onConfirm: (file: File) => void;
  /** Proporção do recorte (largura/altura). Default: 3/4. Ignorado quando aspectPresets é usado. */
  aspect?: number;
  /** Dimensões finais da imagem cropada (canvas). Quando omitido, usa as pixels do crop. */
  targetSize?: { width: number; height: number };
  /** Formato de saída. PNG preserva transparência; JPEG é menor. Default: jpeg. */
  outputFormat?: "image/jpeg" | "image/png";
  /**
   * Lista de presets de aspect ratio. Quando fornecida, renderiza chips de
   * seleção acima da área de crop e ignora os props `aspect` e `targetSize`
   * (cada preset traz os seus próprios).
   */
  aspectPresets?: AspectPreset[];
}

const PhotoEditor = ({
  isOpen,
  photo,
  onConfirm,
  handleClose,
  aspect = 3 / 4,
  targetSize,
  outputFormat = "image/jpeg",
  aspectPresets,
}: PhotoEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

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

  // Reseta seleção quando a foto muda
  useEffect(() => {
    setActivePresetIndex(0);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [photo]);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const activePreset: AspectPreset | null =
    aspectPresets && aspectPresets.length > 0
      ? (aspectPresets[activePresetIndex] ?? aspectPresets[0])
      : null;

  // Aspect efetivo enviado ao Cropper. Quando o preset não define aspect, usa
  // a proporção natural da imagem (= sem corte forçado, "livre").
  const effectiveAspect: number = activePreset
    ? (activePreset.aspect ?? naturalAspect ?? aspect)
    : aspect;

  // Target size efetivo: preset > prop > pixels do crop.
  const effectiveTargetSize = activePreset
    ? activePreset.targetSize
    : targetSize;

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !photoUrl) return;
    const croppedImage = await getCroppedImg(
      photoUrl,
      croppedAreaPixels,
      effectiveTargetSize,
      outputFormat,
    );
    onConfirm(croppedImage);
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-black/80 rounded-lg sm:rounded-xl p-2 sm:p-4 max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl w-[95vw] sm:w-[min(720px,92vw)] max-w-none"
      closer={false}
    >
      {/* Chips de aspect ratio */}
      {aspectPresets && aspectPresets.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 sm:p-3 bg-gray-900 rounded-t-lg sm:rounded-t-xl">
          {aspectPresets.map((p, i) => (
            <button
              key={`${p.label}-${i}`}
              type="button"
              onClick={() => setActivePresetIndex(i)}
              className={[
                "px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors",
                i === activePresetIndex
                  ? "bg-white text-gray-900"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {/* Área do crop: ocupa boa parte da tela no mobile e desktop */}
      <div
        className={[
          "relative w-full flex-1 flex min-h-0 overflow-hidden bg-gray-900",
          aspectPresets && aspectPresets.length > 0
            ? ""
            : "rounded-t-lg sm:rounded-t-xl",
        ].join(" ")}
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
            aspect={effectiveAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={(size) =>
              setNaturalAspect(size.naturalWidth / size.naturalHeight)
            }
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
