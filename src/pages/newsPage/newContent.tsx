import { useEffect, useState } from "react";
import fetchWrapper from "@/utils/fetchWrapper";
import DocxPreview from "@/components/atoms/docxPreview";

interface NewContentProps {
  fileName: string;
}

export default function NewContent({ fileName }: NewContentProps) {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fileName) return;

    const loadDoc = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWrapper(fileName);
        const buffer = await response.arrayBuffer();
        console.log("[DEBUG] arrayBuffer carregado", buffer);
        setArrayBuffer(buffer);
      } catch (err) {
        console.error("[ERRO] Falha ao carregar o arquivo DOCX:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoc();
  }, [fileName]);

  if (!fileName) {
    return <p className="text-center text-gray-400">Nenhum arquivo selecionado.</p>;
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
    <DocxPreview key={fileName} arrayBuffer={arrayBuffer} />
  );
}
