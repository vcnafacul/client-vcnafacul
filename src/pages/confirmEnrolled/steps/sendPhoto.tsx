import PhotoEditor from "@/components/atoms/photoEditor";
import { useModals } from "@/hooks/useModal";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  onSubmit: (file: File) => void;
  back: (file: File | null) => void;
  oldPhoto: File | null;
  requestDocuments: boolean;
}

export default function SendPhoto({
  onSubmit,
  back,
  oldPhoto,
  requestDocuments,
}: Props) {
  const [photo, setPhoto] = useState<File | null>(oldPhoto);
  const [photoPreview, setPhotoPreview] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null); // Erro ao carregar a foto

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
    event.target.value = ""; // permite reselecionar o mesmo arquivo
  };

  // URL não é mais criada aqui; o PhotoEditor recebe o File e cria/revoga a URL internamente

  const handleSubmit = async () => {
    if (!photo) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    onSubmit(photo);
  };

  const handleBack = () => {
    back(photo);
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

  // URL estável para a pré-visualização da foto aprovada (evita imagem quebrada ao re-renderizar)
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
      {/* Seção de dicas e foto */}
      <div>
        {/* Dicas para a foto da carteirinha */}
        <div className="p-4 w-full max-w-5xl bg-blue-50 border-l-4 border-blue-500 rounded-md my-4">
          <h3 className="text-md font-semibold text-blue-800">
            Dicas para uma boa foto:
          </h3>
          <ul className="mt-2 list-disc list-inside text-blue-700 text-sm">
            <li>Certifique-se de que a foto esteja nítida e bem iluminada.</li>
            <li>Use um fundo neutro, como branco ou cinza claro.</li>
            <li>Evite acessórios como óculos de sol ou chapéus.</li>
            <li>Centralize o rosto e mantenha uma expressão neutra.</li>
          </ul>
        </div>

        {/* Upload de foto para carteirinha */}
        <div className="flex flex-col items-center w-full">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Envie sua foto para a carteirinha (proporção 3x4)
          </h2>
          <label className="w-full cursor-pointer block relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="absolute w-px h-px opacity-0 overflow-hidden"
              aria-label="Selecionar foto para carteirinha"
            />
            <span className="flex items-center justify-center text-center py-4 px-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 text-blue-700 font-medium min-h-[48px] touch-manipulation active:bg-blue-100">
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
            <p className="text-red font-semibold text-sm mt-2">{photoError}</p>
          )}
        </div>
      </div>

      {/* Botão de envio */}
      <div className="w-full flex justify-end gap-4">
        {requestDocuments && (
          <button
            className="mt-8 px-6 py-3  text-white rounded font-medium disabled:bg-gray-400 bg-blue-600 w-60"
            onClick={handleBack}
          >
            Voltar
          </button>
        )}
        <button
          className="mt-8 px-6 py-3  text-white rounded font-medium disabled:bg-gray-400 bg-blue-600 w-60"
          onClick={handleSubmit}
        >
          Continuar
        </button>
      </div>

      <ModalPhotoEditor />
    </div>
  );
}
