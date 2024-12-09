/* eslint-disable @typescript-eslint/no-explicit-any */
import { declaredInterest } from "@/services/prepCourse/student/declaredInterest";
import { uploadDocs } from "@/services/prepCourse/student/uploadDocs";
import { uploadPhoto } from "@/services/prepCourse/student/uploadPhoto";
import { useAuthStore } from "@/store/auth";
import { cursos } from "@/utils/listOfCourses";
import { Checkbox } from "@mui/material";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoCloseSharp } from "react-icons/io5";
import { Id, toast } from "react-toastify";
import { areas } from "./area";

interface Props {
  isFree: boolean;
  queryToken: string;
  studentId: string;
}

export default function DeclareInterest({
  isFree,
  queryToken,
  studentId,
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Preview da foto
  const [photoError, setPhotoError] = useState<string | null>(null); // Erro ao carregar a foto
  const [sendedDoc, setSendedDoc] = useState(false);
  const [sendedPhoto, setSendedPhoto] = useState(false);
  const [declaredInt, setDeclaredInt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areaInterest, setAreaInterest] = useState<string[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("");

  const {
    data: { token },
  } = useAuthStore();

  const handleSelectCurso = (e: any) => {
    const curso = e.target.value as string;
    if (curso && !selectedCursos.includes(curso)) {
      setSelectedCursos([...selectedCursos, curso]);
    }
    setSelectedCurso(""); // Resetar o select após a seleção
  };

  const handleRemoveCurso = (cursoToRemove: string) => {
    setSelectedCursos(
      selectedCursos.filter((curso) => curso !== cursoToRemove)
    );
  };

  const handleDeclaredInterest = (id: Id) => {
    declaredInterest(studentId, token)
      .then(() => {
        toast.update(id, {
          render: "Declaração de interesse feita com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setDeclaredInt(true);
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUploadDocs = (id: Id) => {
    uploadDocs(uploadedFiles, queryToken)
      .then(() => {
        toast.update(id, {
          render: "Documentos enviados com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setSendedDoc(true);
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUploadPhoto = (id: Id) => {
    uploadPhoto(uploadedPhoto as File, queryToken)
      .then(() => {
        toast.update(id, {
          render: "Foto para carteirinha enviadas com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setSendedPhoto(true);
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const declaredInterestId = toast.loading(
      "Aguarde enquanto processando a declaração de interesse..."
    );
    const uploadDocumentId = toast.loading("Enviando documentos...");
    const uploadPhotoId = toast.loading("Enviando foto...");
    if (!uploadedPhoto) {
      toast.error("Selecione uma foto para carteirinha");
    }
    if (!sendedDoc && uploadedPhoto && uploadedFiles.length > 0) {
      handleUploadDocs(uploadDocumentId);
    }
    if (!sendedPhoto && uploadedPhoto) {
      handleUploadPhoto(uploadPhotoId);
    }
    if (!declaredInt) {
      handleDeclaredInterest(declaredInterestId);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file: File) =>
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    );
    if (uploadedFiles.length < 10) {
      setUploadedFiles((prev: File[]) => [...prev, ...validFiles]);
    } else {
      toast.error("Limite de arquivos alcançado!");
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
        "Arquivo rejeitado! Tamanho máximo 2MB e limite de 10 arquivos."
      );
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const maxSizeInMB = 1;
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setPhotoError(`O arquivo excede o tamanho máximo de ${maxSizeInMB}MB.`);
        setPhotoPreview(null);
        setUploadedPhoto(null);
      } else {
        setPhotoError(null);
        setPhotoPreview(URL.createObjectURL(file));
        setUploadedPhoto(file);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 w-full">
      {/* Mensagem inicial */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Declaração de interesse na matrícula
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {isFree ? (
            <>
              Parabéns pela isenção! 🎉 Não se esqueça de enviar as informações
              necessárias para concluir sua inscrição.
            </>
          ) : (
            <>
              Olá caro estudante, para declarar interesse na matrícula,
              precisamos de algumas informações a mais.
            </>
          )}
        </p>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Seção de dicas e foto */}
        <div className="space-y-6">
          {/* Dicas para a foto da carteirinha */}
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
            <h3 className="text-md font-semibold text-blue-800">
              Dicas para uma boa foto:
            </h3>
            <ul className="mt-2 list-disc list-inside text-blue-700 text-sm">
              <li>
                Certifique-se de que a foto esteja nítida e bem iluminada.
              </li>
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
              <p className="text-red-500 text-sm mt-2">{photoError}</p>
            )}
          </div>
        </div>

        {/* Upload de documentos */}
        <div>
          {/* Dicas para o envio de documentos */}
          <div className="mb-4 w-full max-w-5xl p-4 bg-fuchsia-50 border-l-4 border-fuchsia-500 rounded-md ">
            <h3 className="text-md font-semibold text-fuchsia-800">
              Informações sobre o envio de documentos:
            </h3>
            <ul className="mt-2 list-disc list-inside text-fuchsia-700 text-sm flex flex-col gap-1">
              <li className={`${isFree ? "" : "hidden"}`}>
                Fazer o upload de todos os documentos necessários para
                comprovação da renda informada no formulário de inscrição.
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
                <span className="font-semibold">é necessário</span> para
                comprovar as informações fornecidas no ato de inscrição. A
                ausência pode dificultar a análise e levar à desclassificação.
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
                <span className="font-semibold">manual do candidato</span> no
                site do cursinho.
              </li>
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
              <p className="text-gray-500 flex gap-1 justify-center">
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
      </div>

      {/* Pesquisa de áreas */}

      <div className="space-y-4 flex flex-col items-center">
        <h3 className="text-sm w-full font-semibold text-emerald-500 border-l-4 border-emerald-500 p-2 bg-emerald-50 rounded-md">
          Áreas de Interesse
        </h3>
        <span className="text-gray-500 text-sm text-center w-full">
          Nos ajude a entender melhor sobre suas expectativas. Assina-le abaixo
          quais áreas você acreditar ter mais dificuldades.
        </span>
        <div className="flex gap-4 max-w-4xl flex-wrap justify-center py-2">
          {areas.map((area) => (
            <div key={area} className="flex items-center px-4">
              <Checkbox
                className="w-6 h-6"
                checked={areaInterest.includes(area)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAreaInterest([...areaInterest, area]);
                  } else {
                    setAreaInterest(
                      areaInterest.filter((item) => item !== area)
                    );
                  }
                }}
                name={area}
                color="primary"
              />
              <span className="text-gray-700">{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cursos de Interesse */}
      <div className="space-y-4 w-full max-w-4xl">
        <h3 className="text-sm font-semibold text-sky-700 border-l-4 border-sky-500 p-2 bg-sky-50 rounded-md">
          Cursos de Interesse
        </h3>
        <div className="flex flex-wrap w-full max-w-4xl items-start justify-center">
          <select
            value={selectedCurso}
            onChange={handleSelectCurso}
            className="w-full max-w-sm p-2 border border-gray-300 rounded-md h-10"
          >
            <option value="">Selecione um curso</option>
            {cursos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
          <div className="min-w-[200px] py-4">
            {selectedCursos.length > 0 && (
              <ul className="list-disc pl-6">
                {selectedCursos.map((curso, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>{curso}</span>
                    <IoCloseSharp
                      className="fill-red w-5 h-5 cursor-pointer"
                      onClick={() => handleRemoveCurso(curso)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Botão de envio */}
      <button
        className={`mt-8 px-6 py-3 text-white rounded font-medium disabled:bg-gray-400 ${
          isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
        }`}
        disabled={sendedDoc}
        onClick={() => handleSubmit().finally(() => setIsSubmitting(false))}
      >
        {isSubmitting ? "Enviando..." : sendedDoc ? "Enviado" : "Enviar Dados"}
      </button>
    </div>
  );
}
