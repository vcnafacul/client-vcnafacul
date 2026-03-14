import { useEffect, useState } from "react";
import DocxPreview from "@/components/atoms/docxPreview";
import { getNewsFile } from "@/services/news/getNewsFile";

interface NewContentProps {
  /** Chave do arquivo no S3 (ex.: news/uuid.docx) */
  fileKey: string;
}

export default function NewContent({ fileKey }: NewContentProps) {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileKey) return;

    const loadDoc = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const buffer = await getNewsFile(fileKey);
        setArrayBuffer(buffer);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar o arquivo";
        setError(message);
        console.error("[ERRO] Falha ao carregar o arquivo DOCX:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoc();
  }, [fileKey]);

  if (!fileKey) {
    return <p className="text-center text-gray-400">Nenhum arquivo selecionado.</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-4">
        {error}
      </p>
    );
  }

  if (isLoading || !arrayBuffer) {
    return (
      <div className="min-h-[500px] w-full bg-gray-100 animate-pulse rounded-md">
        <p className="text-center pt-10 text-gray-400">
          Carregando documento...
        </p>
      </div>
    );
  }

  return (
    <DocxPreview key={fileKey} arrayBuffer={arrayBuffer} />
  );
}
