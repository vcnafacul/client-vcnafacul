import { useState } from "react";
import { toast } from "react-toastify";

interface UseFileDownloadOptions {
  onSuccess?: (fileName: string) => void;
  onError?: (error: unknown) => void;
  showToast?: boolean;
}

interface DownloadFileParams {
  fetchFunction: () => Promise<Blob>;
  fileKey: string;
  customFileName?: string;
}

export function useFileDownload(options?: UseFileDownloadOptions) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async ({
    fetchFunction,
    fileKey,
    customFileName,
  }: DownloadFileParams) => {
    try {
      setIsDownloading(true);
      setError(null);

      // Buscar o arquivo
      const blob = await fetchFunction();
      console.log("blob", blob);

      // Determinar a extensão do arquivo
      let extension = "";
      const fileExtensionMatch = fileKey.match(
        /\.(png|jpeg|jpg|pdf|doc|docx)$/i
      );

      if (!fileExtensionMatch) {
        const mimeType = blob.type; // Exemplo: "image/png", "application/pdf"
        const mimeExtension = mimeType.split("/")[1]; // Pega a parte após a barra
        extension = mimeExtension;
      }

      // Determinar o nome do arquivo
      let fileName: string;
      if (customFileName) {
        fileName = customFileName;
      } else if (extension && !fileKey.includes(".")) {
        fileName = `${fileKey}.${extension}`;
      } else {
        fileName = fileKey;
      }
      console.log("fileName", fileName);

      // Criar o link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar o objeto URL da memória
      URL.revokeObjectURL(url);

      // Callbacks de sucesso
      if (options?.showToast !== false) {
        toast.success(`Download de "${fileName}" iniciado com sucesso!`);
      }
      options?.onSuccess?.(fileName);

      return blob;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao fazer download do arquivo";
      setError(errorMessage);

      console.error("Erro ao buscar o arquivo:", err);

      if (options?.showToast !== false) {
        toast.error(errorMessage);
      }
      options?.onError?.(err);

      throw err;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadFile,
    isDownloading,
    error,
  };
}
