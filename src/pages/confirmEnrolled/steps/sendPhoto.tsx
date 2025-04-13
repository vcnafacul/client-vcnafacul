/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  onSubmit: (file: File) => void;
  back: (file: File | null) => void;
  photo: File | null;
  requestDocuments: boolean;
}

export default function SendPhoto({ onSubmit, back, photo, requestDocuments }: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<File | null>(photo);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Preview da foto
  const [photoError, setPhotoError] = useState<string | null>(null); // Erro ao carregar a foto

  const handlePreview = (file: File) => {
    const maxSizeInMB = 2;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setPhotoError(`O arquivo excede o tamanho máximo de ${maxSizeInMB}MB.`);
      setPhotoPreview(null);
      setUploadedFiles(null);
    } else {
      setPhotoError(null);
      setPhotoPreview(URL.createObjectURL(file));
      setUploadedFiles(file);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePreview(file);
    }
  };

  useEffect(() => {
    if (photo) {
      handlePreview(photo);
    }
  }, []);

  const handleSubmit = async () => {
    if (!uploadedFiles) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    onSubmit(uploadedFiles);
  };

  const handleBack = () => {
    back(uploadedFiles);
  };

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
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Envie sua foto para a carteirinha (3x4)
          </h2>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0 file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {photoPreview && (
            <div className="mt-4 w-32 h-40 border rounded-md overflow-hidden">
              <img
                src={photoPreview}
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
    </div>
  );
}
