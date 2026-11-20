import PhotoEditor from "@/components/atoms/photoEditor";
import { useModals } from "@/hooks/useModal";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  onSubmit: (file: File) => void;
  oldPhoto: File | null;
  requestDocuments: boolean;
  documentsDone: boolean;
  processing: boolean;
}

export default function SendPhoto({
  onSubmit,
  oldPhoto,
  processing,
}: Props) {
  const [photo, setPhoto] = useState<File | null>(oldPhoto);
  const [photoPreview, setPhotoPreview] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const modals = useModals([
    'photoEditor',
  ]);

  const handlePreview = (file: File) => {
    const maxSizeInMB = 2;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setPhotoError(`O arquivo excede o tamanho máximo de ${maxSizeInMB}MB.`);
      setPhoto(null);
    } else {
      setPhotoError(null);
      setPhoto(file);
      modals.photoEditor.close();
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPreview(file);
      modals.photoEditor.open();
    }
    event.target.value = "";
  };

  const handleSubmit = async () => {
    if (!photo) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    onSubmit(photo);
  };

  const ModalPhotoEditor = () => {
    if (!modals.photoEditor.isOpen || !photoPreview) return null;
    return (
      <PhotoEditor
        key={photoPreview.name + photoPreview.lastModified}
        isOpen={modals.photoEditor.isOpen}
        photo={photoPreview}
        onConfirm={handlePreview}
        handleClose={() => {
          modals.photoEditor.close();
        }}
      />
    );
  };

  const photoDisplayUrl = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  );
  useEffect(() => {
    return () => {
      if (photoDisplayUrl) URL.revokeObjectURL(photoDisplayUrl);
    };
  }, [photoDisplayUrl]);

  return (
    <div className="max-w-5xl w-full mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg">
      <div>
        <div className="p-4 w-full max-w-5xl bg-info-muted border-l-4 border-primary rounded-md my-4">
          <h3 className="text-md font-semibold text-foreground">
            Dicas para uma boa foto:
          </h3>
          <ul className="mt-2 list-disc list-inside text-foreground text-body">
            <li>Certifique-se de que a foto esteja nítida e bem iluminada.</li>
            <li>Use um fundo neutro, como branco ou cinza claro.</li>
            <li>Evite acessórios como óculos de sol ou chapéus.</li>
            <li>Centralize o rosto e mantenha uma expressão neutra.</li>
          </ul>
        </div>

        <div className="flex flex-col items-center w-full">
          <h2 className="text-h3 font-medium text-foreground mb-2">
            Envie sua foto para a carteirinha (proporção 3x4)
          </h2>
          <label className="w-full cursor-pointer block relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="absolute w-px h-px opacity-0 overflow-hidden"
              aria-label="Selecionar foto para carteirinha"
              disabled={processing}
            />
            <span className="flex items-center justify-center text-center py-4 px-4 rounded-lg border-2 border-dashed border-info bg-info-muted/50 text-foreground font-medium min-h-[48px] touch-manipulation active:bg-info-muted">
              Toque para escolher ou tirar foto
            </span>
          </label>
          {photo && photoDisplayUrl && (
            <div className="mt-4 w-32 h-40 border rounded-md overflow-hidden">
              <img
                src={photoDisplayUrl}
                alt="Foto para carteirinha"
                className="object-cover w-full h-full"
              />
            </div>
          )}
          {photoError && (
            <p className="text-destructive font-semibold text-body mt-2">{photoError}</p>
          )}
        </div>
      </div>

      <div className="w-full flex justify-end gap-4">
        <button
          className="mt-8 px-6 py-3  text-primary-foreground rounded-sm font-medium disabled:bg-muted disabled:text-muted-foreground bg-primary w-60"
          onClick={handleSubmit}
          disabled={processing}
        >
          {processing ? "Enviando..." : "Continuar"}
        </button>
      </div>

      {ModalPhotoEditor()}
    </div>
  );
}
