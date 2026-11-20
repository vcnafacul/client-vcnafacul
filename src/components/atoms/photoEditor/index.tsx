import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import getCroppedImg from "@/utils/cropImage";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

  /*
    O Radix devolve o foco ao `Trigger`, e este Dialog é aberto por estado, sem Trigger: o foco cairia no
    `body`. Guardamos quem tinha o foco quando o editor abriu (o campo de arquivo, o botão) e devolvemos a ele.
  */
  const abridor = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (isOpen) abridor.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

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

  const temPresets = !!aspectPresets && aspectPresets.length > 0;

  /*
    tickets/059 D21: o editor é um Dialog em portal com título próprio. Aberto de dentro de outro
    Dialog (ModalEditFeature, ModalEditSupporter), o Radix empilha: o de baixo continua aberto, com o
    estado do formulário, e o foco volta para quem abriu (o campo de arquivo) ao fechar o recorte.
    R32: dados em edição, então clicar fora não fecha.
  */
  return (
    <Dialog open={isOpen} onOpenChange={(aberto) => !aberto && handleClose()}>
      <DialogContent
        size="lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          const alvo = abridor.current;
          if (alvo && alvo !== document.body && alvo.isConnected) {
            e.preventDefault();
            alvo.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3 overflow-hidden">
          {temPresets && (
            <div className="flex flex-wrap gap-2">
              {aspectPresets.map((p, i) => (
                <button
                  key={`${p.label}-${i}`}
                  type="button"
                  aria-pressed={i === activePresetIndex}
                  onClick={() => setActivePresetIndex(i)}
                  className={[
                    "rounded-full px-3 py-1.5 text-caption font-semibold transition-colors",
                    i === activePresetIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/70",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {/* Área do crop: ocupa o que sobra da tela, com pelo menos 320px para o Cropper renderizar */}
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-md bg-foreground sm:min-h-[50vh]">
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
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Aprovar foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default PhotoEditor;
