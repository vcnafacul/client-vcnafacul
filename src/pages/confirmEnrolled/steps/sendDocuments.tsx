/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

interface Props {
  isFree: boolean;
  onSubmit: (files: File[]) => void;
  files: File[];
}

export default function SendDocuments({ isFree, onSubmit, files }: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(files);

  const handleDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file: File) =>
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    );
    if (validFiles.length === 0 || validFiles.length !== acceptedFiles.length) {
      {
        toast.warning(
          "Formato de arquivo inválido. Aceitamos apenas imagens JPEG, PNG ou PDFs",
          {
            theme: "dark",
          }
        );
      }
    }
    if (uploadedFiles.length < 10) {
      setUploadedFiles((prev: File[]) => [...prev, ...validFiles]);
    } else {
      toast.error("Limite de arquivos alcançado!", {
        theme: "dark",
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev: any) =>
      prev.filter((_: any, i: number) => i !== index)
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: true, // Permite múltiplos arquivos
    accept: { "image/*": [], "application/pdf": [] }, // Apenas imagens ou PDFs
    maxSize: 2 * 1024 * 1024,
    maxFiles: 10,
    onDropRejected: () => {
      toast.error(
        "Arquivo rejeitado! Tamanho máximo 2MB e limite de 10 arquivos.",
        {
          theme: "dark",
        }
      );
    },
  });

  const hanfleSubmit = () => {
    onSubmit(uploadedFiles);
  };

  return (
    <div className="max-w-5xl w-full mx-auto p-6 space-y-8 bg-white shadow-md rounded-lg flex flex-col">
      <div>
        {/* Dicas para o envio de documentos */}
        <div className="w-full max-w-5xl p-4 bg-fuchsia-50 border-l-4 border-fuchsia-500 rounded-md my-4">
          <h3 className="text-md font-semibold text-fuchsia-800">
            Informações sobre o envio de documentos:
          </h3>
          <ul className="mt-2 list-disc list-inside text-fuchsia-700 text-sm flex flex-col gap-1">
            <li className={`${isFree ? "" : "hidden"}`}>
              Fazer o upload de todos os documentos necessários para comprovação
              da renda informada no formulário de inscrição.
            </li>
            <li className={`${isFree ? "" : "hidden"}`}>
              Consulte a lista de documentos necessários no{" "}
              <span className="font-semibold">manual do candidato</span>,
              disponível no site do cursinho.
            </li>
            <li className={`${isFree ? "hidden" : ""}`}>
              É necessário enviar o comprovante de pagamento da taxa de
              matrícula.
            </li>
            <li className={`${isFree ? "hidden" : ""}`}>
              O <span className="font-semibold">boleto</span> foi encaminhado
              por e-mail pelo cursinho.
            </li>
            <li>
              O envio {`${isFree ? "dos documentos" : "do comprovante"}`}{" "}
              <span className="font-semibold">é necessário</span> para comprovar
              as informações fornecidas no ato de inscrição. A ausência pode
              dificultar a análise e levar à desclassificação.
            </li>
            <li>
              O envio {`${isFree ? "dos documentos" : "do comprovante"}`} é{" "}
              <span className="font-semibold">único</span>. Após clicar em
              "Enviar Dados", você{" "}
              <span className="font-semibold">
                não poderá corrigir ou reenviar
              </span>{" "}
              {`${isFree ? "os documentos" : "o comprovante"}`}
            </li>
            <li>
              Em caso de duvidas, antes de enviar, consultar o{" "}
              <span className="font-semibold">manual do candidato</span> no site
              do cursinho.
            </li>
            <li>Os tipos de arquivos aceitos são: JPEG, PNG e PDF.</li>
          </ul>
        </div>

        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-md text-center ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500">Solte os arquivos aqui...</p>
          ) : (
            <p className="text-gray-500 flex gap-1 justify-center flex-col">
              <span>
                Arraste e solte os arquivos aqui, ou clique para selecionar.
              </span>
              <span className="text-blue-500">
                Limit: {uploadedFiles.length}/10
              </span>
            </p>
          )}
        </div>

        {/* Lista de arquivos enviados */}
        <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
          {uploadedFiles.map((file: any, index: number) => (
            <li
              key={index}
              className="flex justify-between items-center text-gray-600 text-sm border p-2 rounded-md"
            >
              <span>{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="mt-8 px-6 py-3 text-white rounded font-medium disabled:bg-gray-400 bg-blue-600 w-60 self-end"
        onClick={hanfleSubmit}
      >
        Contínuar
      </button>
    </div>
  );
}
